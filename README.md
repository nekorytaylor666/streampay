# StreamFlow Finance App

[![Deploy](https://github.com/StreamFlow-Finance/streamflow-app/actions/workflows/gh-pages-prod.yml/badge.svg)](https://github.com/StreamFlow-Finance/streamflow-app/actions/workflows/gh-pages-prod.yml)

Web application client for the **StreamFlow streaming payments protocol**.

Serverless. Realtime. **Built on Solana.**

- [Website](https://streamflow.finance)
- [App](https://app.streamflow.finance)
- [GitHub](https://github.com/streamflow-finance)
- [Telegram](https://t.me/streamflow_fi)
- [Twitter](https://twitter.com/streamflow_fi)

Dev build available at https://streamflow-dev.netlify.app/

To run locally, git clone the repository and then:

```
  npm i
  npm run start
```

Use devnet tokens: `9EEPMBwMFUaJwiztYkKWKjMraZ4PLjQtwhcDUggDZyy8`
Mint more using `devnet-authority.json` key.


Add some tokens for the localhost and devnet:
```
[skip] solana airdrop 1
[skip] spl-token create-token
token=9EEPMBwMFUaJwiztYkKWKjMraZ4PLjQtwhcDUggDZyy8 #
spl-token create-account $token
spl-token mint $token <AMOUNT>
spl-token transfer $token <AMOUNT> <WALLET_ADDRESS> --fund-recipient --allow-unfunded-recipient
```

and then update `ourToken`'s address (to match `<TOKEN>`) in `helpers/utils.ts`. Voila, now you have test tokens! to play with. :)
