// 浏览器环境直接运行，Node.js需先执行：npm install node-fetch
const extractTVChannels = async () => {
  try {
    // 1. 发起请求获取原始文本
    const response = await fetch('https://freetv.fun/test_channels_original_new.txt');
    if (!response.ok) throw new Error('请求失败');
    let rawText = await response.text();

    // 2. 文本清洗与过滤（保留频道数据，剔除注释和空行）
    const cleanLines = rawText
      .split('\n')
      .filter(line => 
        line.trim() !== '' && 
        !line.startsWith('#') && 
        !line.includes('#genre#')
      );

    // 3. 整理数据结构（按国家/地区分组）
    const channelData = {};
    let currentRegion = '';
    
    cleanLines.forEach(line => {
      // 识别国家/地区行（无逗号分隔，非链接行）
      if (!line.includes(',https://') && !line.includes(',rtmp://')) {
        currentRegion = line.trim();
        if (!channelData[currentRegion]) channelData[currentRegion] = [];
      } else {
        // 解析频道信息（名称+链接）
        const [name, url] = line.split(',');
        if (currentRegion && name && url) {
          channelData[currentRegion].push({
            name: name.trim(),
            url: url.trim()
          });
        }
      }
    });

    // 4. 输出整理结果（格式化打印）
    console.log('📺 全球电视直播频道整理结果');
    console.log('==========================');
    Object.entries(channelData).forEach(([region, channels]) => {
      console.log(`\n🌍 ${region}（共${channels.length}个频道）`);
      channels.forEach(({ name, url }, index) => {
        console.log(`  ${index + 1}. ${name} -> ${url}`);
      });
    });

    // 可选：导出为JSON文件（浏览器环境可触发下载）
    const jsonData = JSON.stringify(channelData, null, 2);
    if (typeof window !== 'undefined') {
      const blob = new Blob([jsonData], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'tv_channels.json';
      a.click();
    } else {
      // Node.js环境写入文件
      const fs = require('fs');
      fs.writeFileSync('tv_channels.json', jsonData);
      console.log('\n📁 已导出数据到 tv_channels.json');
    }

    return channelData;
  } catch (error) {
    console.error('❌ 处理失败：', error.message);
    return null;
  }
};

// 执行提取
extractTVChannels();
