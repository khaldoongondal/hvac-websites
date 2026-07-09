"""Quick script to print the header row from the sheet."""
import gspread
from google.oauth2.credentials import Credentials as OAuthCredentials
from google.auth.transport.requests import Request

SHEET_NAME     = "HVAC Leads"
WORKSHEET_NAME = "USA"
OAUTH_TOKEN    = "oauth_token.json"
SCOPES         = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]

creds  = OAuthCredentials.from_authorized_user_file(OAUTH_TOKEN, SCOPES)
if creds.expired and creds.refresh_token:
    creds.refresh(Request())

client = gspread.authorize(creds)
ws     = client.open(SHEET_NAME).worksheet(WORKSHEET_NAME)
headers = ws.row_values(1)

print(f"Found {len(headers)} columns:\n")
for i, h in enumerate(headers, 1):
    print(f"  {i:>3}. '{h}'")
