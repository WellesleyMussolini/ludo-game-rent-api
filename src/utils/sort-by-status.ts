import { PipelineStage } from 'mongoose';

export function sortByStatusPriority(
  field: string,
  priorityMap: Record<string, number>,
  defaultPriority = 99,
): PipelineStage[] {
  return [
    {
      $addFields: {
        statusPriority: {
          $switch: {
            branches: Object.entries(priorityMap).map(([key, value]) => ({
              case: { $eq: [`$${field}`, key] },
              then: value,
            })),
            default: defaultPriority,
          },
        },
        rentalSortDate: {
          $cond: {
            if: { $eq: [`$${field}`, 'overdue'] },
            then: '$rentalStartDate', // Oldest first for OVERDUE
            else: {
              $cond: {
                if: { $eq: [`$${field}`, 'returned'] },
                then: '$returnedAt', // Newest first for RETURNED
                else: '$rentalStartDate', // Newest first for ACTIVE
              },
            },
          },
        },
        rentalSortOrder: {
          $cond: {
            if: { $eq: [`$${field}`, 'overdue'] },
            then: 1, // Ascending for OVERDUE (oldest first)
            else: -1, // Descending for ACTIVE and RETURNED (newest first)
          },
        },
      },
    },
    {
      $sort: {
        statusPriority: 1, // Sort by status priority
        rentalSortDate: 1, // OVERDUE (oldest first), ACTIVE & RETURNED (newest first)
      },
    },
  ];
}
