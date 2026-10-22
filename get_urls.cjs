const https = require('https');
const fs = require('fs');
const url = "https://zwxvjlnzhjmsuwjnwvqv.supabase.co/rest/v1/products?select=name,image_url";
const headers = {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3eHZqbG56aGptc3V3am53dnF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1ODcwNjIsImV4cCI6MjA4NTE2MzA2Mn0.GA0nRGSMr9XxXHc1VhpSeSB2hnaZknO2ojedpsTWrw4",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3eHZqbG56aGptc3V3am53dnF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1ODcwNjIsImV4cCI6MjA4NTE2MzA2Mn0.GA0nRGSMr9XxXHc1VhpSeSB2hnaZknO2ojedpsTWrw4"
};
https.get(url, { headers }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const products = JSON.parse(data);
        let md = '| 상품명 | 이미지 URL |\n|---|---|\n';
        products.forEach(p => md += `| ${p.name} | ${p.image_url} |\n`);
        fs.writeFileSync('C:\\\\Users\\\\USER\\\\Desktop\\\\urls.md', md, 'utf8');
    });
});
