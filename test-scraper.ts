import * as cheerio from "cheerio";

async function test() {
  const response = await fetch("https://giabac.vn/");
  const html = await response.text();
  const $ = cheerio.load(html);
  
  console.log("Title:", $("title").text());
  
  // Try to find tables or specific classes
  $("table tr").each((i, el) => {
    console.log($(el).text().trim().replace(/\s+/g, ' '));
  });
}

test();
