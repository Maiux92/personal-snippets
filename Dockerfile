FROM php:8.2-apache

WORKDIR /var/www/html

# Copy source code into the container
COPY src/ /var/www/html/

# Ensure proper permissions for Apache
RUN chown -R www-data:www-data /var/www/html && chmod -R 755 /var/www/html

# Expose port 80
EXPOSE 80

