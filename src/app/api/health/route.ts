// Health check endpoint for Docker and load balancer

export async function GET() {
  try {
    // Basic health check - could add database ping here
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'VariationVault',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };

    return Response.json(healthStatus, { status: 200 });
  } catch (error) {
    return Response.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 503 }
    );
  }
}