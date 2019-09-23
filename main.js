const axios = require("axios");
const sugar = require("sugar-date");
const cheerio = require("cheerio");

// constants
const codeRe = /[A-Z0-9]{11}/g;
const oneDayAgo = sugar.Date.create("1 day ago");

// Helper function(s)
const cleanText = str =>
  str.replace(/<\/?[^>]+(>|$)/g, "").replace(/(\r\n|\n|\r)/gm, " ");

// Setup URL list
const genCrunchyRollCommentsUrl = mediaKey =>
  `https://www.crunchyroll.com/comments?pg=0&talkboxid=1001-MEDIAKEY_${mediaKey}&sort=score_desc%2Cdate_desc&replycount=5&threadlimit=1&pagelimit=4`;
const urlList = [];
for (let i = 786935; i < 786990; i++) {
  urlList.push(genCrunchyRollCommentsUrl(i));
}

const main = async lastAcceptableDate => {
  const lastAcceptableDateFilter = a => a > lastAcceptableDate;
  let matchingComments = [];
  for (let url of urlList) {
    // await this if you get timeouts or errors
    axios({
      method: "get",
      url,
      headers: {
        authority: "www.crunchyroll.com",
        pragma: "no-cache",
        "cache-control": "no-cache",
        "upgrade-insecure-requests": "1",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36",
        "sec-fetch-mode": "navigate",
        "sec-fetch-user": "?1",
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
        "sec-fetch-site": "none",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "en-US,en;q=0.9,ja;q=0.8",
        "x-requested-with": "XMLHttpRequest"
      }
    })
      .then(a => a.data)
      .then(comments => {
        try {
          for (let comment of comments) {
            const { body, formattedTimeCreated } = comment.comment;
            const date = sugar.Date.create(formattedTimeCreated);
            if (codeRe.test(body)) {
              const cleanBody = cleanText(body);
              const matches = cleanBody.match(codeRe);

              matchingComments.push({
                formattedTimeCreated,
                body: cleanBody,
                matches,
                date
              });
              if (lastAcceptableDateFilter(date)) {
                // console.log(`${formattedTimeCreated}: "${cleanBody}"`);
                matches.forEach(a => {
                  const redemptionUrl = `https://www.crunchyroll.com/coupon_redeem?code=${a}`;

                  console.log(redemptionUrl);
                  //   axios
                  //     .get(redemptionUrl)
                  //     .then(a => a.data)
                  //     .then(a => {
                  // 	  const $ = cheerio.load(a);
                  // 	  console.log('RESULTS:',$('.error-message').text(),a)
                  //     });
                });
              }
            }
          }
        } catch (err) {
          // silence all errors
          // console.error(err.message, url);
        }
      })
      .catch(a => a); // silence more errors
  }
  //   matchingComments.sort((a, b) => b.date - a.date);
  //   matchingComments
  // .filter(a => a.date > lastAcceptableDate)
  // .forEach(a => console.log(`${a.formattedTimeCreated}: "${a.body}"`));
};
main(oneDayAgo);
