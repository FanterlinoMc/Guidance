<?php

namespace App\Services\Retrieval;

final class VisibilityFilter
{
    /**
     * Default-deny gate: only items whose visibility appears in $allowedVisibility survive.
     *
     * @param array<int, array<string, mixed>> $items
     * @param string[] $allowedVisibility
     * @return array<int, array<string, mixed>>
     */
    public function filter(array $items, array $allowedVisibility): array
    {
        $allowed = array_flip($allowedVisibility);

        return array_values(array_filter(
            $items,
            function (array $item) use ($allowed): bool {
                return isset($allowed[$item['visibility']]);
            },
        ));
    }
}
