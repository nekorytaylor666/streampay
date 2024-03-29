# Streamflow Finance App

[![Deploy](https://github.com/Streamflow-Finance/streamflow-app/actions/workflows/gh-pages-prod.yml/badge.svg)](https://github.com/Streamflow-Finance/streamflow-app/actions/workflows/gh-pages-prod.yml)

Web application client for the **Streamflow streaming payments protocol**.

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

Add some tokens for the localhost and devnet:

```
solana airdrop 1
spl-token create-token
token=<TOKEN> #save token mint address for later use
spl-token create-account $token
acc=<TOKEN_ACCOUNT> #save token account address for later use
spl-token mint $token <AMOUNT>
spl-token transfer $token <AMOUNT> <WALLET_ADDRESS> --fund-recipient --allow-unfunded-recipient
```

and then update `ourToken`'s address (to match `<TOKEN>`) in `Main.tsx`. Voila, now you have test tokens! to play with. :)
