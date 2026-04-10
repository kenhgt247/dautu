async function test() {
  try {
    const res = await fetch("https://giabac.vn/");
    console.log("Status:", res.status);
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
