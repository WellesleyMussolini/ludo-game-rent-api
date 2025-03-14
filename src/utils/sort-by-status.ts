import { PipelineStage } from 'mongoose';

[
  {
    key: 'status',
    value: 1,
  },
];

export function sortByStatusPriority(
  field: string,

  priorityMap: Record<string, number>,
  defaultPriority = 99,
): PipelineStage[] {
  return [
    {
      $addFields: {
        priority: {
          $switch: {
            branches: Object.entries(priorityMap).map(([key, value]) => ({
              case: { $eq: [`$${field}`, key] },
              then: value,
            })),
            default: defaultPriority,
          },
        },
      },
    },
    { $sort: { priority: 1 } },
  ];
}
