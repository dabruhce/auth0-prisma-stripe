# auth0-prisma-stripe

primarily based off
* https://github.com/LawJolla/prisma-auth0-example
* changed the way the identity is stored from identityToken.sub.split
* prisma cloud wasnt working migrated to local docker instance
* updated packages
* made quick stripe test for normal user create
* stripe connect, didn't finish flow



### server steps
````

git clone https://github.com/tkntobfrk/auth0-prisma-stripe.git

cd auth0-prisma-stripe
cd server

touch .env

##.env
PRISMA_SECRET=prisma
PRISMA_ENDPOINT=
AUTH0_DOMAIN=${????}.auth0.com
AUTH0_AUDIENCE=https://${????}.auth0.com/api/v2/
AUTH0_ISSUER=https://${????}.auth0.com/


docker-compose up -d
yarn install
prisma deploy
yarn dev

````

### update auth0-prisma-stripe/server/index.js line 11 with stripe key
````

const stripe = require('stripe')('${$$$$$$$$$$$$$$$$$$$}')


````

### update src/components/StripeExpress.js line 6 with stripe key
````

const stripeUrl =

````


### app steps

````
cd auth0-prisma-stripe
cd src
cd auth

touch auth0-variables.js

##auth0-variables.js
export const AUTH_CONFIG = {
  api_audience: 'https://${????}.auth0.com/api/v2/',
  domain: '${????}.auth0.com',
  clientId: '${????}',
  callbackUrl: 'http://localhost:8000/callback'
}

yarn install
yarn start

````

### reset docker nonsense
````
docker-compose down
docker system prune --volumes
````
