# Deployment

Build the React dashboard with `npm run build --prefix frontend`. Deploy the resulting `frontend/build` directory to a static host and set `REACT_APP_API_URL` to the public backend URL.

Deploy the Node backend as a service that runs `npm start --prefix backend`, exposes the configured `PORT`, and provides the MQTT/Firebase variables from `config/.env.example`. Keep credentials in the hosting provider's secret store; do not commit `.env` files.