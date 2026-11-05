export type AwsAccount = { id: string; name: string; profiles: string[] };
export const AWS_ACCOUNTS_KEY = 'awsAccountLabels';
export const AWS_ENABLED_KEY = 'awsAccountLabelsEnabled';

export function parseAccounts(input: string): AwsAccount[] {
    if (input.length > 500_000) throw new Error('Import must be smaller than 500 KB.');
    let records: AwsAccount[];
    if (/^\[\s*(?:\{|\])/.test(input.trim())) {
        const data: unknown = JSON.parse(input);
        if (!Array.isArray(data)) throw new Error('Expected a JSON array.');
        records = data.map(value => {
            if (!value || typeof value.id !== 'string' || !/^\d{12}$/.test(value.id)
                || typeof value.name !== 'string' || !value.name.trim()
                || (value.profiles !== undefined && (!Array.isArray(value.profiles)
                    || !value.profiles.every((p: unknown) => typeof p === 'string')))) {
                throw new Error('Each account needs a 12-digit string id, a name, and optional profiles array.');
            }
            return { id: value.id, name: value.name.trim(), profiles: value.profiles ?? [] };
        });
    } else {
        records = [];
        let profile = '';
        for (const line of input.split(/\r?\n/)) {
            const section = line.trim().match(/^\[([^\]]+)\]$/);
            if (section) {
                profile = section[1].startsWith('profile ') ? section[1].slice(8) : section[1] === 'default' ? 'default' : '';
            } else {
                const account = line.match(/^\s*sso_account_id\s*=\s*(\d{12})\s*(?:#.*)?$/);
                if (account && profile) records.push({ id: account[1], name: profile, profiles: [profile] });
            }
        }
        if (!records.length) throw new Error('Paste JSON accounts or AWS config containing SSO profiles with sso_account_id.');
    }
    const merged = new Map<string, AwsAccount>();
    for (const record of records) {
        const existing = merged.get(record.id);
        if (existing) existing.profiles = [...new Set([...existing.profiles, ...record.profiles])];
        else merged.set(record.id, record);
    }
    if (merged.size > 1000) throw new Error('Maximum 1,000 accounts.');
    return [...merged.values()];
}
