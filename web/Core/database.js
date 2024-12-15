export async function getActiveWallet(user_id) {
    try {
        console.log('Getting active wallet for user', user_id);
        const response = await fetch(`https://miniappserv.com/api/wallets/active/${user_id}`);
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error getting wallets:', error.message);
        throw error;
    }
}

