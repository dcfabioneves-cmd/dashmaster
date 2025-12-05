import pandas as pd

class DataProcessor:
    def process(self, raw_data: list, categories: list):
        if not raw_data:
            return {}

        df = pd.DataFrame(raw_data)
        
        # Normalização básica de nomes de colunas
        df.columns = [c.lower().replace(' ', '_') for c in df.columns]

        # Garantir que colunas numéricas sejam números
        for col in df.columns:
            if col not in ['date', 'mes', 'data', 'mes_ano']:
                df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

        # Preparar resposta
        result = {}
        
        # Adicionar timeline completa
        result['timeline'] = df.to_dict(orient='records')
        
        # Calcular KPIs Totais (Médias/Somas)
        # Aqui você poderia filtrar por categorias se a planilha tiver coluna 'categoria'
        # Como exemplo, retornamos a média de tudo
        summary = df.mean(numeric_only=True).to_dict()
        result.update(summary)

        return result