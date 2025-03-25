import { weatherCache } from './weatherCache';

export interface APIHealthStatus {
  isHealthy: boolean;
  lastChecked: Date;
  errorMessage?: string;
  responseTime?: number;
  serviceStatus: {
    current: boolean;
    forecast: boolean;
    history: boolean;
  };
}

class WeatherAPIHealthCheck {
  private static instance: WeatherAPIHealthCheck;
  private status: APIHealthStatus;
  private checkInterval: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.status = {
      isHealthy: true,
      lastChecked: new Date(),
      serviceStatus: {
        current: true,
        forecast: true,
        history: true
      }
    };
  }

  public static getInstance(): WeatherAPIHealthCheck {
    if (!WeatherAPIHealthCheck.instance) {
      WeatherAPIHealthCheck.instance = new WeatherAPIHealthCheck();
    }
    return WeatherAPIHealthCheck.instance;
  }

  public getStatus(): APIHealthStatus {
    return { ...this.status };
  }

  public async checkHealth(): Promise<APIHealthStatus> {
    const startTime = Date.now();
    
    try {
      // Test location that should always work
      const testLocation = 'London';
      
      // Check current weather endpoint
      const currentResponse = await fetch(`/api/weather?q=${testLocation}&endpoint=current`);
      const currentHealthy = currentResponse.ok;

      // Check forecast endpoint
      const forecastResponse = await fetch(`/api/weather?q=${testLocation}&endpoint=forecast&days=1`);
      const forecastHealthy = forecastResponse.ok;

      // Check history endpoint
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const historyDate = yesterday.toISOString().split('T')[0];
      const historyResponse = await fetch(`/api/weather?q=${testLocation}&endpoint=history&from=${historyDate}`);
      const historyHealthy = historyResponse.ok;

      const responseTime = Date.now() - startTime;

      this.status = {
        isHealthy: currentHealthy && forecastHealthy && historyHealthy,
        lastChecked: new Date(),
        responseTime,
        serviceStatus: {
          current: currentHealthy,
          forecast: forecastHealthy,
          history: historyHealthy
        }
      };

      // Clear error message if everything is healthy
      if (this.status.isHealthy) {
        delete this.status.errorMessage;
      }

    } catch (error) {
      this.status = {
        isHealthy: false,
        lastChecked: new Date(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred',
        serviceStatus: {
          current: false,
          forecast: false,
          history: false
        }
      };
    }

    return this.status;
  }

  public startMonitoring(): void {
    if (this.checkInterval) {
      return; // Already monitoring
    }
    
    // Perform initial check
    this.checkHealth();
    
    // Set up periodic checks
    this.checkInterval = setInterval(() => {
      this.checkHealth();
    }, this.CHECK_INTERVAL);
  }

  public stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

export const apiHealthCheck = WeatherAPIHealthCheck.getInstance(); 