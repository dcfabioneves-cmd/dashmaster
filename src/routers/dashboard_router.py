from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from src.services.google_service import GoogleSheetService
from src.services.data_processor import DataProcessor
from src.services.ai_forecasting import predict_trends
from src.auth import get_current_user # Protege a rota

router = APIRouter(prefix="/process-data", tags=["Dashboard"])

class DataRequest(BaseModel):
    spreadsheet_url: str
    categories: List[str]

# Serviços instanciados
google_service = GoogleSheetService()
processor = DataProcessor()

@router.post("/")
async def process_dashboard_data(request: DataRequest, current_user = Depends(get_current_user)):
    try:
        # 1. Obter dados brutos
        raw_data = google_service.get_sheet_data(request.spreadsheet_url)
        
        # 2. Processar com Pandas
        processed_data = processor.process(raw_data, request.categories)
        
        # 3. Gerar Insights de IA
        ai_data = predict_trends(processed_data.get('timeline', []))
        
        return {
            "status": "success",
            "data": processed_data,
            "ai_insights": ai_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))