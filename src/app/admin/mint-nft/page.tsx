'use client';

import { MintGovernanceNftForm } from '@/components/admin/mint-governance-nft-form';
import { withAdmin } from '@/components/with-admin';

function MintNftPage() {
    return (
        <div className="mx-auto max-w-2xl">
            <MintGovernanceNftForm />
        </div>
    );
}

export default withAdmin(MintNftPage);
