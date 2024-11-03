class APILoadBalancer {
    constructor(Api1,Api2 ,preferredRatio = 0.85, forceType2) {
        this.Api1 = Api1;
        this.Api2 = Api2;
        this.preferredRatio = preferredRatio; 
        this.totalRequests = 0;
        this.api2Requests = 0;
    }

    async makeRequest(requestData) {
        try {
            this.totalRequests++;
            const currentRatio = this.api2Requests / this.totalRequests;

            if (currentRatio < this.preferredRatio) {
                this.api2Requests++;
                return await this.Api2(...requestData)
            } else {
                return await this.Api1(...requestData);
            }
        } catch (error) {
            return await this.fallbackRequest(requestData);
        }
    }

    async fallbackRequest(requestData) {
        try {
            if (this.api2Requests / this.totalRequests >= this.preferredRatio) {
                this.api2Requests++;
                return await this.Api2(...requestData);
            } else {
                return await this.Api1(...requestData);
            }
        } catch (error) {
            throw new Error('Balancer Error, contact fb.com/Lazic.Kanzu');
        }
    }

    getStats() {
        return {
            totalRequests: this.totalRequests,
            api2Requests: this.api2Requests,
            api1Requests: this.totalRequests - this.api2Requests,
            currentRatio: (this.api2Requests / this.totalRequests) * 100
        };
    }
}

module.exports = APILoadBalancer;
