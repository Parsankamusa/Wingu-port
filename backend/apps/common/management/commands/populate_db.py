from django.core.management.base import BaseCommand
from apps.common.factory import create_sample_data

class Command(BaseCommand):
    help = 'Populates the database with sample data'

    def add_arguments(self, parser):
        parser.add_argument('--pros', type=int, default=20, help='Number of professionals')
        parser.add_argument('--recruiters', type=int, default=5, help='Number of recruiters')
        parser.add_argument('--admins', type=int, default=2, help='Number of admins')
        parser.add_argument('--jobs', type=int, default=30, help='Number of job postings')
        parser.add_argument('--applications', type=int, default=50, help='Number of applications')

    def handle(self, *args, **options):
        self.stdout.write('Starting database population...')
        
        create_sample_data(
            num_professionals=options['pros'],
            num_recruiters=options['recruiters'],
            num_admins=options['admins'],
            num_job_postings=options['jobs'],
            num_applications=options['applications']
        )
        
        self.stdout.write(self.style.SUCCESS('Database successfully populated!'))