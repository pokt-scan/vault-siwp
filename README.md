Sign-In with Pocket describes how Pocket accounts authenticate with
off-chain services by signing a standard message format parameterized by scope,
session details, and security mechanisms (e.g., a nonce). The goals of this
specification are to provide a self-custodied alternative to centralized
identity providers, improve interoperability across off-chain services for
Pocket-based authentication, and provide wallet vendors a consistent
machine-readable message format to achieve improved user experiences and
consent management.

## Quickstart Examples
As this project is inspired in the Spruce Sign-In with Ethereum project and it is fully compliant, the same examples can be used to test the Sign-In with Pocket. The examples can be found in the following repositories:

- [Node](https://github.com/spruceid/siwe-quickstart/tree/main/00_print)
- [Frontend](https://github.com/spruceid/siwe-quickstart/tree/main/01_frontend)
- [Backend](https://github.com/spruceid/siwe-quickstart/tree/main/02_backend)
- [End to end](https://github.com/spruceid/siwe-quickstart/tree/main/03_complete_app)
- [Sign-In with Ethereum Notepad](https://github.com/spruceid/siwe-notepad)

## Motivation
When signing in to popular non-blockchain services today, users will typically
use identity providers (IdPs) that are centralized entities with ultimate
control over users' identifiers, for example, large internet companies and email
providers. Incentives are often misaligned between these parties. Sign-In with
Pocket offers a new self-custodial option for users who wish to assume more
control and responsibility over their own digital identity.

## Specification
There is not an official Pocket Network specification yet, for reference the original specification issued for ethereum can be found [here](https://eips.ethereum.org/EIPS/eip-4361).

## Disclaimer

Our TypeScript library for Sign-In with Pocket has not yet undergone a formal security
audit. We welcome continued feedback on the usability, architecture, and security
of this implementation.

## Mono Repo Install and Build
Run `pnpm install` to install dependencies, then `pnpm build` to build the library.
Development can occur on the `package/*` level with tests being run on each package itself.

To run all tests: `pnpm test`
