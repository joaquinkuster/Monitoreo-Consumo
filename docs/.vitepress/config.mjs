import { defineConfig } from 'vitepress'

export default defineConfig({
    title: "Monitoreo de Consumo Eléctrico",
    description: "Sistema distribuido en tiempo real para monitoreo inteligente de consumo energético",

    head: [
        ['link', { rel: 'icon', href: '/favicon.ico' }],
        ['link', { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css' }]
    ],

    markdown: {
        theme: {
            light: 'github-light',
            dark: 'github-dark'
        },
        lineNumbers: true
    },

    themeConfig: {
        logo: '/logo-dashboard.png',

        nav: [
            { text: 'Inicio', link: '/' },
            { text: 'Índice', link: '/INDICE' },
            { text: 'Guía', link: '/guide/introduction' },
            { text: 'API', link: '/api/websocket' },
            {
                text: 'Recursos',
                items: [
                    { text: 'GitHub', link: 'https://github.com' },
                    { text: 'Firebase Console', link: 'https://console.firebase.google.com' }
                ]
            }
        ],

        sidebar: {
            '/guide/': [
                {
                    text: 'Introducción',
                    items: [
                        { text: '¿Qué es este sistema?', link: '/guide/introduction' },
                        { text: 'Arquitectura', link: '/guide/architecture' }
                    ]
                },
                {
                    text: 'Configuración',
                    items: [
                        { text: 'Instalación', link: '/guide/installation' },
                        { text: 'Ejecución', link: '/guide/running' }
                    ]
                }
            ],
            '/api/': [
                {
                    text: 'Referencia de API',
                    items: [
                        { text: 'WebSocket API', link: '/api/websocket' },
                        { text: 'MQTT API', link: '/api/mqtt' }
                    ]
                }
            ]
        },

        socialLinks: [
            { icon: 'github', link: 'https://github.com/joaquinkuster' },
            { icon: 'github', link: 'https://github.com/Marcos2497' },
            { icon: 'github', link: 'https://github.com/lazamartinez' }
        ],

        footer: {
            message: 'Sistema de Monitoreo de Consumo Eléctrico - Paradigmas y Lenguajes de Programación 2025',
            copyright: 'Küster Joaquín • Da Silva Marcos • Martinez Lázaro Ezequiel'
        },

        search: {
            provider: 'local'
        },

        editLink: {
            pattern: 'https://github.com/your-repo/edit/main/docs/:path',
            text: 'Editar esta página en GitHub'
        },

        lastUpdated: {
            text: 'Última actualización',
            formatOptions: {
                dateStyle: 'short',
                timeStyle: 'short'
            }
        }
    },

    // Mermaid support
    mermaid: true,

    vite: {
        resolve: {
            alias: {
                '@': '/docs'
            }
        }
    }
})
