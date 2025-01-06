import {getActiveWallet} from './Core/database.js';


//format
// {
//     "wallet":"GDTOJL273O5YKNF3PIG72UZRG6CT4TRLDQK2NT5ZBMN3A56IP4JSYRUQ",
//     "tokens": {
//     "BTC": {
//         "balance": 1.25,
//             "history": [
//                     {
//                         "time": "2025-01-04T02:00:33Z",
//                         "amount": 0.01
//                     },
//                     {
//                         "time": "2025-01-04T02:00:33Z",
//                         "amount": 0.0035594
//                     },
//                     {
//                         "time": "2025-01-05T02:00:33Z",
//                         "amount": 0.01
//                     },
//                     {
//                         "time": "2025-01-05T02:00:33Z",
//                         "amount": 0.0035741
//                     }],
//         "time_to_mine": "2024-12-12T20:00:00Z"
//     }
// }
// }

//user-id 350104566
export async function get_config(user_id) {
    const wallet_data = await getActiveWallet(user_id);
    const balance = wallet_data.history.reduce((acc, val) => acc + val.amount, 0);

// return wallet_data;
    return {
        "wallet": wallet_data.address,
        "tokens": {
            "BTC": {
                "balance": balance,
                "history": wallet_data.history,
                "btc_get_time": wallet_data.btc_get_time
            }
        },
        "servers": wallet_data.servers
    };
}