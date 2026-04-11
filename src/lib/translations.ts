export const translations = {
  es: {
    chat: {
      placeholder: "Introduce tus criterios de inversión...",
      welcome: "Hola.\n\nVoy a ayudarte a encontrar oportunidades de inversión.\n\nPara empezar, puedes contarme en una frase qué estás buscando o qué te gustaría hacer con tu inversión.",
      supportActive: "Copiloto activo",
      refineQuestion: "¿Estás de acuerdo con mi selección o te gustaría analizar otros?",
      errorRetry: "La conexión con el índice global falló. Por favor intente de nuevo.",
      contradiction: "⚠️ El agente detectó una posible contradicción — revisá su respuesta"
    },
    radar: {
      strategy: "Estrategia",
      horizon: "Horizonte",
      involve: "Involucramiento",
      risk: "Riesgo",
      budget: "Presupuesto",
      investorVector: "Investor Strategy Vector",
      userProfile: "Perfil de {{name}}",
      confirmed: "✓ Perfil confirmado",
      passive: "Pasivo",
      semiActive: "Semi-activo",
      active: "Activo",
      short: "Corto plazo",
      medium: "Medio plazo",
      long: "Largo plazo"
    },
    header: {
      infraText: "The infrastructure for global real estate investment decisions",
      matchedOpportunities: "Oportunidades Coincidentes",
      assetsMatching: "{{count}} Assets coinciden con tu estrategia.",
      retry: "Reintentar",
      noMatches: "Sin coincidencias estrictas",
      filterWarning: "Tus filtros duros (Ubicación, Tipo) son restrictivos para el mock actual.",
      points: "puntos",
      rank: {
        Gold: "Oro",
        Silver: "Plata",
        Bronze: "Bronce"
      }
    },
    menus: {
      gear: {
        help: "Ayuda",
        whatIsGeoland: "¿Qué es Geoland?"
      },
      profile: {
        myBureau: "Mi Bureau",
        myFavorites: "Mis favoritos",
        myAlerts: "Mis alertas",
        usage: "Uso",
        subscription: "Suscripción",
        logout: "Cerrar sesión"
      }
    },
    assetCard: {
        price: "Precio",
        roiEst: "ROI Est.",
        confidence: "Confidence",
        capRate: "Cap Rate"
    }
  },
  en: {
    chat: {
      placeholder: "Introduce your investment criteria...",
      welcome: "Hello.\n\nI'm going to help you find investment opportunities.\n\nTo start, you can tell me in a sentence what you are looking for or what you would like to do with your investment.",
      supportActive: "Copilot active",
      refineQuestion: "Are you satisfied with my selection or would you like to analyze others?",
      errorRetry: "Connection to global index failed. Please retry.",
      contradiction: "⚠️ The agent detected a possible contradiction — review its response"
    },
    radar: {
      strategy: "Strategy",
      horizon: "Horizon",
      involve: "Involvement",
      risk: "Risk",
      budget: "Budget",
      investorVector: "Investor Strategy Vector",
      userProfile: "{{name}}'s Profile",
      confirmed: "✓ Profile confirmed",
      passive: "Passive",
      semiActive: "Semi-active",
      active: "Active",
      short: "Short term",
      medium: "Medium term",
      long: "Long term"
    },
    header: {
      infraText: "The infrastructure for global real estate investment decisions",
      matchedOpportunities: "Matched Opportunities",
      assetsMatching: "{{count}} Assets matching strategy.",
      retry: "Retry",
      noMatches: "No strict matches",
      filterWarning: "Your hard filters (Location, Type) are restrictive for the current mock.",
      points: "points",
      rank: {
        Gold: "Gold",
        Silver: "Silver",
        Bronze: "Bronze"
      }
    },
    menus: {
      gear: {
        help: "Help",
        whatIsGeoland: "What is Geoland?"
      },
      profile: {
        myBureau: "My Bureau",
        myFavorites: "My favorites",
        myAlerts: "My alerts",
        usage: "Usage",
        subscription: "Subscription",
        logout: "Sign out"
      }
    },
    assetCard: {
        price: "Price",
        roiEst: "ROI Est.",
        confidence: "Confidence",
        capRate: "Cap Rate"
    }
  },
  pt: {
    chat: {
      placeholder: "Insira seus critérios de investimento...",
      welcome: "Olá.\n\nVou ajudá-lo a encontrar oportunidades de investimento.\n\nPara começar, você pode me dizer em uma frase o que está procurando ou o que gostaria de fazer com seu investimento.",
      supportActive: "Copiloto ativo",
      refineQuestion: "Você está satisfeito com minha seleção ou gostaria de analisar outras?",
      errorRetry: "A conexão com o índice global falhou. Por favor, tente novamente.",
      contradiction: "⚠️ O agente detectou uma possível contradição — revise a resposta dele"
    },
    radar: {
      strategy: "Estratégia",
      horizon: "Horizonte",
      involve: "Envolvimento",
      risk: "Risco",
      budget: "Orçamento",
      investorVector: "Investor Strategy Vector",
      userProfile: "Perfil de {{name}}",
      confirmed: "✓ Perfil confirmado",
      passive: "Passivo",
      semiActive: "Semi-ativo",
      active: "Ativo",
      short: "Curto prazo",
      medium: "Médio prazo",
      long: "Longo prazo"
    },
    header: {
      infraText: "The infrastructure for global real estate investment decisions",
      matchedOpportunities: "Oportunidades Correspondentes",
      assetsMatching: "{{count}} ativos correspondem à sua estratégia.",
      retry: "Tentar novamente",
      noMatches: "Sem correspondências estritas",
      filterWarning: "Seus filtros rígidos (Localização, Tipo) são restritivos para o modelo atual.",
      points: "pontos",
      rank: {
        Gold: "Ouro",
        Silver: "Prata",
        Bronze: "Bronze"
      }
    },
    menus: {
      gear: {
        help: "Ajuda",
        whatIsGeoland: "O que é a Geoland?"
      },
      profile: {
        myBureau: "Meu Bureau",
        myFavorites: "Meus favoritos",
        myAlerts: "Meus alertas",
        usage: "Uso",
        subscription: "Assinatura",
        logout: "Sair"
      }
    },
    assetCard: {
        price: "Preço",
        roiEst: "ROI Est.",
        confidence: "Confiança",
        capRate: "Cap Rate"
    }
  }
};

export type Language = keyof typeof translations;
