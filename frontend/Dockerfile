FROM nginx:alpine

# Remove default nginx static assets and configs
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/*

# Setup non-root directories and permissions
RUN mkdir -p /tmp/client_temp /tmp/proxy_temp_path /tmp/fastcgi_temp /tmp/uwsgi_temp /tmp/scgi_temp /usr/share/nginx/html && \
    chmod -R 777 /tmp && \
    chown -R 1001:1001 /var/cache/nginx /var/log/nginx /etc/nginx /usr/share/nginx/html

# Copy main NGINX configuration
COPY --chown=1001:1001 nginx.conf /etc/nginx/nginx.conf

# Copy all Belle static HTML and asset files
COPY --chown=1001:1001 . /usr/share/nginx/html

USER 1001

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]