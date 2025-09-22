# ---------- Stage 1: Build ----------
FROM python:3.11-slim AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Declare build args (optional for pip, but needed to avoid errors)
ARG DB_HOST
ARG DB_NAME
ARG DB_USER
ARG DB_PASSWORD
ARG DB_PORT
ARG DJANGO_SECRET_KEY
ARG DEBUG

# Install dependencies into a temporary folder
COPY requirements/base.txt ./requirements/base.txt
RUN pip install --no-cache-dir --prefix=/install -r requirements/base.txt gunicorn

# ---------- Stage 2: Runtime ----------
FROM python:3.11-slim

WORKDIR /app

# Copy installed Python packages from builder
COPY --from=builder /install /usr/local

# Copy application code
COPY . .

# Declare ARGs and set ENV variables
ARG DB_HOST
ARG DB_NAME
ARG DB_USER
ARG DB_PASSWORD
ARG DB_PORT
ARG DJANGO_SECRET_KEY
ARG DEBUG

ENV DB_HOST=$DB_HOST \
    DB_NAME=$DB_NAME \
    DB_USER=$DB_USER \
    DB_PASSWORD=$DB_PASSWORD \
    DB_PORT=$DB_PORT \
    DJANGO_SECRET_KEY=$DJANGO_SECRET_KEY \
    DEBUG=$DEBUG

# Create non-root user
RUN useradd -m appuser && chown -R appuser /app
USER appuser

# Collect static files
#RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "-c", "gunicorn.conf.py", "config.wsgi:application"]