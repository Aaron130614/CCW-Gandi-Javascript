//我会在下面一些地方做注释，希望你能看懂
(function(Scratch) {
    'use strict';
    class WeatherAssistantExtension {
        constructor() {
            this.apiKey = '';//此处填写你的openweathermap的API密钥
            this.baseUrl = 'https://api.openweathermap.org/data/2.5/weather';
            this.currentWeather = null;
            this.apiUsage = {
                limit: 60, 
                remaining: 60, 
                resetTime: 0 
            };
            this.docsUrl = 'https://learn.ccw.site/article/bedf94cb-5523-457e-9be9-4d3c55671f1d'; // 扩展文档页面URL
        }

        getInfo() {
            return {
                id: 'weather',
                name: '至乐の天气助手',
                color1: '#00bbff', 
                docsURI: this.docsUrl, // 文档页面URL
                blocks: [
                    {
                        opcode: 'getWeather',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '获取[CITY]的天气',
                        arguments: {
                            CITY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'beijing'
                            }
                        }
                    },
                    {
                        opcode: 'checkWeatherAlert',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: '[CITY]有天气警报吗？',
                        arguments: {
                            CITY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'shanghai'
                            }
                        }
                    },
                    {
                        opcode: 'getTemperature',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '获取[CITY]的温度(℃)',
                        arguments: {
                            CITY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'guangzhou'
                            }
                        }
                    },
                    {
                        opcode: 'getWeatherCondition',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '获取[CITY]的天气状况',
                        arguments: {
                            CITY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'shenzhen'
                            }
                        }
                    },
                    {
                        opcode: 'getWindSpeed',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '获取[CITY]的风速(m/s)',
                        arguments: {
                            CITY: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'hangzhou'
                            }
                        }
                    },
                    {
                        opcode: 'getRemainingQuota',
                        blockType: Scratch.BlockType.REPORTER,
                        text: '获取今日剩余请求次数'
                    }
                ],
                menus: {
                    
                    // 可以添加自定义菜单（如果你需要）
                }
            };
        }

        // 文档按钮
        onInit() {
            const button = document.createElement('button');
            button.textContent = '查看文档';
            button.style.position = 'absolute';
            button.style.bottom = '10px';
            button.style.right = '10px';
            button.style.padding = '8px 16px';
            button.style.backgroundColor = '#4CAF50';
            button.style.color = '#fff';
            button.style.border = 'none';
            button.style.borderRadius = '4px';
            button.style.cursor = 'pointer';
            button.style.zIndex = '1000';

            button.addEventListener('click', () => {
                window.open(this.docsUrl, '_blank');
            });
            const scratchGui = document.querySelector('.scratch-gui');
            if (scratchGui) {
                scratchGui.appendChild(button);
            }
        }

        async fetchWeatherData(city) {
            try {
                const url = `${this.baseUrl}?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric&lang=zh_cn`;
                const response = await fetch(url);
                
                // 更新API使用情况
                if (response.headers.has('X-RateLimit-Limit')) {
                    this.apiUsage.limit = parseInt(response.headers.get('X-RateLimit-Limit'), 10);
                }
                if (response.headers.has('X-RateLimit-Remaining')) {
                    this.apiUsage.remaining = parseInt(response.headers.get('X-RateLimit-Remaining'), 10);
                }
                if (response.headers.has('X-RateLimit-Reset')) {
                    this.apiUsage.resetTime = parseInt(response.headers.get('X-RateLimit-Reset'), 10);
                }

                if (!response.ok) {
                    throw new Error(`天气数据获取失败: ${response.status}`);
                }
                const data = await response.json();
                this.currentWeather = data;
                return data;
            } catch (error) {
                console.error('获取天气数据时出错:', error);
                return null;
            }
        }

        async getWeather(args) {
            const city = args.CITY;
            const data = await this.fetchWeatherData(city);
            if (data && data.weather) {
                return `${data.name}的天气：${data.weather[0].description}，温度：${data.main.temp}°C，风速：${data.wind.speed}m/s`;
            }
            return '无法获取天气数据';
        }

        async checkWeatherAlert(args) {
            const city = args.CITY;
            const data = await this.fetchWeatherData(city);
            if (data && data.weather) {
                const condition = data.weather[0].description.toLowerCase();
                const windSpeed = data.wind.speed;
                // 警报条件：天气包含"大风"/"台风"或风速大于14m/s（相当于6级风）
                return condition.includes('大风') || 
                       condition.includes('台风') || 
                       windSpeed > 14;
            }
            return false;
        }

        async getTemperature(args) {
            const city = args.CITY;
            const data = await this.fetchWeatherData(city);
            if (data && data.main) {
                return Math.round(data.main.temp);
            }
            return '未知';
        }

        async getWeatherCondition(args) {
            const city = args.CITY;
            const data = await this.fetchWeatherData(city);
            if (data && data.weather) {
                return data.weather[0].description;
            }
            return '未知';
        }

        async getWindSpeed(args) {
            const city = args.CITY;
            const data = await this.fetchWeatherData(city);
            if (data && data.wind) {
                return data.wind.speed;
            }
            return '未知';
        }

        getRemainingQuota() {
            return this.apiUsage.remaining;
        }
    }

    Scratch.extensions.register(new WeatherAssistantExtension());
})(Scratch);