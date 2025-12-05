from sklearn.linear_model import LinearRegression
import numpy as np
import pandas as pd

def predict_trends(timeline_data: list):
    """
    Prevê o próximo valor para a métrica principal (ex: 'valor' ou 'conversoes')
    """
    if not timeline_data or len(timeline_data) < 3:
        return None

    df = pd.DataFrame(timeline_data)
    
    # Identificar métrica principal (ex: valor, receita, leads)
    target_col = None
    for col in ['valor', 'receita', 'leads', 'conversoes', 'taxa_abertura']:
        if col in df.columns:
            target_col = col
            break
    
    if not target_col:
        return None

    # Preparar dados
    df['period_idx'] = range(len(df))
    X = df[['period_idx']].values
    y = df[target_col].values

    # Treinar modelo
    model = LinearRegression()
    model.fit(X, y)

    # Previsão próximo mês
    next_idx = [[len(df)]]
    prediction = model.predict(next_idx)[0]
    
    # Tendência
    slope = model.coef_[0]
    trend = "up" if slope > 0 else "down"

    return {
        "metric": target_col,
        "next_month_value": round(float(prediction), 2),
        "trend": trend,
        # Dados para o gráfico de previsão (Histórico + Futuro)
        "history": df[['date', target_col]].rename(columns={target_col: 'valor'}).to_dict(orient='records') if 'date' in df.columns else [],
        "forecast": [{"date": "Previsão", "valor": round(float(prediction), 2)}]
    }