import gspread
from oauth2client.service_account import ServiceAccountCredentials
from src.config import settings
import os

class GoogleSheetService:
    def __init__(self):
        self.scope = [
            "https://spreadsheets.google.com/feeds",
            "https://www.googleapis.com/auth/drive"
        ]
        self.creds_path = settings.CREDENTIALS_PATH
        self.client = None

    def _authenticate(self):
        if not os.path.exists(self.creds_path):
            # Retorna None para usar dados Mock se não houver arquivo
            print(f"⚠️ Aviso: Arquivo {self.creds_path} não encontrado.")
            return None
            
        creds = ServiceAccountCredentials.from_json_keyfile_name(self.creds_path, self.scope)
        self.client = gspread.authorize(creds)
        return self.client

    def get_sheet_data(self, spreadsheet_url: str):
        if not self.client:
            if not self._authenticate():
                # Retorna dados simulados se falhar auth
                return self._get_mock_data()

        try:
            sheet = self.client.open_by_url(spreadsheet_url)
            worksheet = sheet.get_worksheet(0) # Pega a primeira aba
            records = worksheet.get_all_records()
            return records
        except Exception as e:
            print(f"Erro ao acessar Google Sheets: {e}")
            return self._get_mock_data()

    def _get_mock_data(self):
        # Dados de fallback para teste
        return [
            {"date": "2023-01", "taxa_abertura": 20, "engajamento": 50, "valor": 1000},
            {"date": "2023-02", "taxa_abertura": 22, "engajamento": 55, "valor": 1200},
            {"date": "2023-03", "taxa_abertura": 18, "engajamento": 40, "valor": 900},
            {"date": "2023-04", "taxa_abertura": 25, "engajamento": 60, "valor": 1500},
            {"date": "2023-05", "taxa_abertura": 26, "engajamento": 65, "valor": 1600},
            {"date": "2023-06", "taxa_abertura": 30, "engajamento": 70, "valor": 2000},
        ]