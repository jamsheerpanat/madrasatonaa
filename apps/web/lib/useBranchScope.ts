
import { useMe } from './useMe';

export function useBranchScope() {
    const { me, loading } = useMe();

    if (loading || !me) return [];

    return me.branch_scope_ids || [];
}
