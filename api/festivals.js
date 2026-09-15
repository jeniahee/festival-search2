const API_URL = 'https://apis.data.go.kr/B551011/KorService2/searchFestival2';

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'METHOD_NOT_ALLOWED' });

  const key = process.env.DATA_GO_KR_API_KEY;
  if (!key) return json(res, 500, { error: 'API_KEY_NOT_CONFIGURED' });

  const input = new URL(req.url, 'http://localhost').searchParams;
  const startDate = input.get('startDate') || input.get('eventStartDate');
  const endDate = input.get('endDate') || input.get('eventEndDate');
  const region = input.get('region') || input.get('lDongRegnCd');
  const keyword = (input.get('keyword') || '').trim().toLowerCase();

  if (!startDate) return json(res, 400, { error: 'START_DATE_REQUIRED' });

  // The copied portal key may already contain percent escapes. Keep it as-is;
  // encoding it again would turn %2F into %252F and invalidate the key.
  const params = new URLSearchParams({
    numOfRows: '100', pageNo: '1', MobileOS: 'WEB', MobileApp: 'FestivalFinder',
    _type: 'json', arrange: 'A', eventStartDate: startDate.replaceAll('-', '')
  });
  if (endDate) params.set('eventEndDate', endDate.replaceAll('-', ''));
  if (region) params.set('lDongRegnCd', region);
  const query = `serviceKey=${key}&${params.toString()}`;

  try {
    const upstream = await fetch(`${API_URL}?${query}`);
    const data = await upstream.json();
    const header = data?.response?.header || {};
    if (!upstream.ok || header.resultCode !== '0000') {
      return json(res, 502, { error: 'PUBLIC_API_ERROR', resultCode: header.resultCode, resultMsg: header.resultMsg });
    }
    const sourceItems = data?.response?.body?.items?.item || [];
    const items = sourceItems
      .filter((item) => {
        if (!keyword) return true;
        return `${item.title || ''} ${item.addr1 || ''}`.toLowerCase().includes(keyword);
      })
      .map((item) => ({
        title: item.title || '',
        address: item.addr1 || '',
        startDate: item.eventstartdate || '',
        endDate: item.eventenddate || '',
        image: item.firstimage2 || item.firstimage || ''
      }));
    return json(res, 200, { items });
  } catch (error) {
    return json(res, 502, { error: 'PUBLIC_API_UNAVAILABLE' });
  }
};
