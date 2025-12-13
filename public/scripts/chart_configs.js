// ===== CHART CONFIGURATIONS =====
window.CHART_CONFIGS = {
    'email': [
        { title: 'Taxa de Abertura', type: 'line', dataKey: 'taxa_abertura' },
        { title: 'Taxa de Cliques', type: 'line', dataKey: 'taxa_cliques' },
        { title: 'Taxa de Conversão', type: 'bar', dataKey: 'taxa_conversao' },
        { title: 'Taxa de Rejeição', type: 'line', dataKey: 'taxa_rejeicao' }
    ],
    'social': [
        { title: 'Alcance', type: 'line', dataKey: 'alcance' },
        { title: 'Engajamento', type: 'line', dataKey: 'engajamento' },
        { title: 'Crescimento Seguidores', type: 'bar', dataKey: 'crescimento_seguidores' },
        { title: 'Taxa CTR', type: 'line', dataKey: 'taxa_ctr' },
        { title: 'Taxa CPC', type: 'line', dataKey: 'taxa_cpc' },
        { title: 'Taxa CPM', type: 'line', dataKey: 'taxa_cpm' },
        { title: 'Taxa CPV', type: 'line', dataKey: 'taxa_cpv' },
        { title: 'Taxa ROAS', type: 'line', dataKey: 'taxa_roas' }
    ],
    'seo': [
        { title: 'Crescimento do Tráfego', type: 'line', dataKey: 'crescimento_trafego' },
        { title: 'CTR SEO', type: 'line', dataKey: 'ctr_seo' },
        { title: 'Posicionamento Médio', type: 'line', dataKey: 'posicionamento_medio' },
        { title: 'Autoridade', type: 'bar', dataKey: 'autoridade' },
        { title: 'Backlinks', type: 'line', dataKey: 'backlinks' },
        { title: 'Ticket médio / Conversão', type: 'bar', dataKey: 'ticket_medio_conversao' },
        { title: 'Conversões', type: 'line', dataKey: 'conversoes' },
        { title: 'Receita', type: 'line', dataKey: 'receita' }
    ],
    'ecommerce': [
        { title: 'Taxa de Conversão (CVR)', type: 'line', dataKey: 'taxa_conversao_cvr' },
        { title: 'Ticket Médio', type: 'bar', dataKey: 'ticket_medio' },
        { title: 'Custo de Aquisição por Cliente', type: 'line', dataKey: 'custo_aquisicao_cliente' },
        { title: 'Retenção', type: 'line', dataKey: 'retencao' },
        { title: 'Taxa de Abandono do Carrinho', type: 'line', dataKey: 'taxa_abandono_carrinho' },
        { title: 'Taxa de Cancelamento', type: 'line', dataKey: 'taxa_cancelamento' },
        { title: 'Tempo Médio de Entrega', type: 'bar', dataKey: 'tempo_medio_entrega' },
        { title: 'ROAS', type: 'line', dataKey: 'roas' }
    ],
    'google-ads': [
        { title: 'CTR GOOGLE', type: 'line', dataKey: 'ctr_google' },
        { title: 'CPC GOOGLE', type: 'line', dataKey: 'cpc_google' },
        { title: 'CONVERSÕES GOOGLE', type: 'bar', dataKey: 'conversoes_google' },
        { title: 'CPA GOOGLE', type: 'line', dataKey: 'cpa_google' },
        { title: 'ROAS GOOGLE', type: 'line', dataKey: 'roas_google' }
    ],
    'meta-ads': [
        { title: 'CPM', type: 'line', dataKey: 'cpm' },
        { title: 'CTR', type: 'line', dataKey: 'ctr' },
        { title: 'CPC', type: 'line', dataKey: 'cpc' },
        { title: 'Frequência', type: 'bar', dataKey: 'frequencia' },
        { title: 'Conversões', type: 'line', dataKey: 'conversoes' },
        { title: 'CPA', type: 'line', dataKey: 'cpa' },
        { title: 'ROAS', type: 'line', dataKey: 'roas' }
    ],
    'blog': [
        { title: 'Sessões', type: 'line', dataKey: 'sessoes' },
        { title: 'Page Views', type: 'bar', dataKey: 'page_views' },
        { title: 'Tempo Médio na Página (min)', type: 'line', dataKey: 'tempo_medio_pagina_min' },
        { title: 'Leads Convertidos', type: 'bar', dataKey: 'leads_convertidos' },
        { title: 'Taxa de Rejeição', type: 'line', dataKey: 'taxa_rejeicao' }
    ]
};
