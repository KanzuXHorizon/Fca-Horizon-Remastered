const MemoryManager = require('./Release_Memory');
const path = require('path');

// Tạo một đối tượng MemoryManager với các tùy chọn cấu hình tối ưu
const memoryManager = new MemoryManager({
  warningThreshold: 0.6, // Ngưỡng cảnh báo sử dụng bộ nhớ (60%)
  releaseThreshold: 0.7, // Ngưỡng giải phóng bộ nhớ (70%)
  maxThreshold: 0.8, // Ngưỡng tối đa sử dụng bộ nhớ (80%)
  interval: 30000, // Khoảng thời gian kiểm tra bộ nhớ (30 giây)
  logLevel: 'warn', // Chỉ ghi nhật ký khi có cảnh báo hoặc lỗi
  logFile: path.join(__dirname, 'memory.log'), // Tệp nhật ký
  smartReleaseEnabled: true, // Bật tính năng giải phóng bộ nhớ thông minh
});

memoryManager.addMemoryUsageListener((memoryUsage) => {
  console.log(`Memory released: ${(memoryUsage * 100).toFixed(2)}%`);
});


// Bắt đầu quá trình quản lý bộ nhớ tự động
memoryManager.autoStart(3600000); // 1 giờ


// Lưu trữ dữ liệu quan trọng trong WeakMap
const importantData = { sensitive: 'data' };
memoryManager.weakRefs.set('aaaaaaaaa', importantData);

console.log(memoryManager.weakRefs.get('aaaaaaaaa'))