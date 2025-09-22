# gunicorn.conf.py
import multiprocessing

# Server socket
bind = "0.0.0.0:8000"

# Worker processes
workers = 3
worker_class = "sync"
worker_connections = 1000
timeout = 300
keepalive = 2

# Logging
accesslog = "-"  # stdout
errorlog = "-"   # stdout
loglevel = "info"

# Process naming
proc_name = "winguport-backend"

# Server mechanics
preload_app = True
max_requests = 1000
max_requests_jitter = 50