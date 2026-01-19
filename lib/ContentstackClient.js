import Contentstack from '@contentstack/delivery-sdk';

const stack = Contentstack.stack({
  apiKey: process.env.CONTENTSTACK_API_KEY,
  deliveryToken: process.env.CONTENTSTACK_DELIVERY_TOKEN,
  environment: process.env.CONTENTSTACK_ENVIRONMENT,
});

export default stack;
