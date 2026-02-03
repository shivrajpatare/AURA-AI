FROM node:20-alpine

WORKDIR /app

# Copy package info first for caching
COPY package*.json ./

# Install ALL dependencies (including typescript for build)
RUN npm install

# Copy source code
COPY . .

# Build TypeScript to JavaScript (dist/)
RUN npm run build

# Expose the API port
EXPOSE 3000

# Start the built application
CMD ["npm", "start"]
