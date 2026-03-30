# Use official Node image
FROM node:18

# Set working directory inside container
WORKDIR /app

# Copy only package files first to install dependencies
COPY package*.json ./

# Install dependencies inside Docker
RUN npm install

# Copy rest of the project files (excluding node_modules via .dockerignore)
COPY . .

# Build the app (this step needs correct arch)
RUN npm run build

# Install a simple static file server
RUN npm install -g serve

# Command to run app
CMD ["serve", "-s", "dist", "-l", "3000"]
