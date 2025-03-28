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
          $switch: {
            branches: [
              {
                // For overdue, sort by rentalStartDate ascending (oldest first)
                case: { $eq: [`$${field}`, 'overdue'] },
                then: '$rentalStartDate',
              },
              {
                // For active, sort by rentalStartDate descending (newest first)
                case: { $eq: [`$${field}`, 'active'] },
                then: { $multiply: [-1, { $toLong: '$rentalStartDate' }] },
              },
              {
                // For returned, sort by returnedAt descending (newest first)
                case: { $eq: [`$${field}`, 'returned'] },
                then: { $multiply: [-1, { $toLong: '$returnedAt' }] },
              },
            ],
            default: '$rentalStartDate',
          },
        },
      },
    },
    {
      $sort: {
        statusPriority: 1, // Order: overdue → active → returned
        rentalSortDate: 1, // For overdue: oldest first; active/returned: newest first (thanks to -1 multiplier)
      },
    },
  ];
}
