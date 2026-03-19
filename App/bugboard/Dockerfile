# Official njs image
FROM node:20-alpine

# Install pgsql and sudo
RUN apk add --no-cache postgresql postgresql-contrib sudo

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Copy startup script
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 3000

CMD ["/start.sh"]