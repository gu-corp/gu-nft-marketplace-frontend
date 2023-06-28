<h3 align="center">G.U.NFT marketplace</h3>
  <p align="center">
An NFT marketplace.

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started (Self-Hosted)

### Prerequisites

1. Install [Node.js and NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
2. Install [Yarn](https://classic.yarnpkg.com/en/docs/install)

### Built With

- [Next.js](https://nextjs.org/)
- [React.js](https://reactjs.org/)
- [Ethers.io](https://ethers.io/)
- [WAGMI](https://wagmi.sh/)
- [Stitches](https://stitches.dev/docs/variants)

### Installation

Fork this repo and follow these instructions to install dependancies.

With yarn:

```bash
$ yarn install
```

With NPM:

```bash
$ npm install
```

### Configuration

G.U.NFT marketplace is lightly configurable with the configurations below. You can either add these to a `.env.production` and `.env.development` or add env variables to a deployment platform like [vercel](https://vercel.com/).

**Environment Variables**
| Environment Variable | Required | Description | Example |
|--------------------------------|----------|-------------------------------------------------------------------------------------|---------------------|
| NEXT_PUBLIC_BASE_URL | `true` | The domain that the deployed project is hosted on. | http://localhost:3000 |
| NEXT_PUBLIC_API_URL | `true` | The domain that the deployed api project is hosted on. | http://localhost:3001 |
| NEXT_PUBLIC_NETWORK_ID | `true` | The network id. | gu-sandbox-dev |


In addition to the configuration above we've also added comments prefixed with `CONFIGURABLE:` throughout the app pointing out some pieces of code where you could customize functionality. After cloning the app make sure to search the repo for the aforementioned prefix.

### Run the App

Once you have your setup ready, run:

With yarn:

    $ yarn dev

With npm:

    $ npm run dev
