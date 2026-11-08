// listening-lessons-data.js
// Kho dữ liệu Bài học Luyện Nghe VSTEP + Chép chính tả + Luyện nói (Shadowing)
// Tách biệt độc lập để dễ dàng bổ sung bài học mới (YouTube / ELLLO / VSTEP Y khoa) mà không cần nhập thủ công trên giao diện web.

(function (global) {
  'use strict';

  // Từ điển IPA & Nghĩa Tiếng Việt chuẩn Oxford/Cambridge cho toàn bộ từ vựng trong các bài học
  const WORD_DICT = {
    // Đại từ, giới từ, từ nối & từ thông dụng
    i: { ipa: '/aɪ/', pos: 'pron', vi: 'tôi' },
    "i'm": { ipa: '/aɪm/', pos: 'phr', vi: 'tôi là / tôi đang' },
    "i've": { ipa: '/aɪv/', pos: 'phr', vi: 'tôi đã' },
    "i'd": { ipa: '/aɪd/', pos: 'phr', vi: 'tôi muốn / tôi sẽ' },
    "i'll": { ipa: '/aɪl/', pos: 'phr', vi: 'tôi sẽ' },
    my: { ipa: '/maɪ/', pos: 'det', vi: 'của tôi' },
    me: { ipa: '/miː/', pos: 'pron', vi: 'tôi' },
    you: { ipa: '/juː/', pos: 'pron', vi: 'bạn' },
    "you're": { ipa: '/jʊər/', pos: 'phr', vi: 'bạn đang / bạn là' },
    your: { ipa: '/jɔːr/', pos: 'det', vi: 'của bạn' },
    he: { ipa: '/hiː/', pos: 'pron', vi: 'anh ấy' },
    she: { ipa: '/ʃiː/', pos: 'pron', vi: 'cô ấy' },
    it: { ipa: '/ɪt/', pos: 'pron', vi: 'nó / điều đó' },
    "it's": { ipa: '/ɪts/', pos: 'phr', vi: 'nó là / trời đang' },
    its: { ipa: '/ɪts/', pos: 'det', vi: 'của nó' },
    we: { ipa: '/wiː/', pos: 'pron', vi: 'chúng tôi / chúng ta' },
    our: { ipa: '/aʊər/', pos: 'det', vi: 'của chúng ta' },
    they: { ipa: '/ðeɪ/', pos: 'pron', vi: 'họ / chúng' },
    their: { ipa: '/ðeər/', pos: 'det', vi: 'của họ' },
    them: { ipa: '/ðem/', pos: 'pron', vi: 'họ / chúng' },
    this: { ipa: '/ðɪs/', pos: 'det', vi: 'này / điều này' },
    that: { ipa: '/ðæt/', pos: 'det', vi: 'đó / rằng' },
    "that's": { ipa: '/ðæts/', pos: 'phr', vi: 'đó là' },
    these: { ipa: '/ðiːz/', pos: 'det', vi: 'những cái này' },
    those: { ipa: '/ðoʊz/', pos: 'det', vi: 'những cái đó' },
    there: { ipa: '/ðeər/', pos: 'adv', vi: 'ở đó / có' },
    here: { ipa: '/hɪər/', pos: 'adv', vi: 'ở đây' },
    what: { ipa: '/wɑːt/', pos: 'pron', vi: 'cái gì' },
    "what's": { ipa: '/wɑːts/', pos: 'phr', vi: 'cái gì là' },
    when: { ipa: '/wen/', pos: 'adv', vi: 'khi nào / khi mà' },
    where: { ipa: '/weər/', pos: 'adv', vi: 'ở đâu' },
    which: { ipa: '/wɪtʃ/', pos: 'pron', vi: 'cái nào / điều mà' },
    who: { ipa: '/huː/', pos: 'pron', vi: 'ai / người mà' },
    why: { ipa: '/waɪ/', pos: 'adv', vi: 'tại sao' },
    how: { ipa: '/haʊ/', pos: 'adv', vi: 'như thế nào / bao lâu' },
    a: { ipa: '/ə/', pos: 'det', vi: 'một' },
    an: { ipa: '/æn/', pos: 'det', vi: 'một' },
    the: { ipa: '/ðə/', pos: 'det', vi: 'cái / người / sự việc' },
    and: { ipa: '/ænd/', pos: 'conj', vi: 'và' },
    or: { ipa: '/ɔːr/', pos: 'conj', vi: 'hoặc' },
    but: { ipa: '/bʌt/', pos: 'conj', vi: 'nhưng' },
    so: { ipa: '/soʊ/', pos: 'conj', vi: 'vì vậy / rất' },
    because: { ipa: '/bɪˈkɔːz/', pos: 'conj', vi: 'bởi vì' },
    if: { ipa: '/ɪf/', pos: 'conj', vi: 'nếu' },
    while: { ipa: '/waɪl/', pos: 'conj', vi: 'trong khi' },
    although: { ipa: '/ɔːlˈðoʊ/', pos: 'conj', vi: 'mặc dù' },
    whether: { ipa: '/ˈweð.ɚ/', pos: 'conj', vi: 'liệu rằng' },
    either: { ipa: '/ˈiː.ðɚ/', pos: 'conj', vi: 'hoặc là' },
    in: { ipa: '/ɪn/', pos: 'prep', vi: 'trong / ở' },
    on: { ipa: '/ɑːn/', pos: 'prep', vi: 'trên / vào' },
    at: { ipa: '/æt/', pos: 'prep', vi: 'tại / vào lúc' },
    to: { ipa: '/tuː/', pos: 'prep', vi: 'đến / để' },
    for: { ipa: '/fɔːr/', pos: 'prep', vi: 'cho / trong khoảng' },
    from: { ipa: '/frʌm/', pos: 'prep', vi: 'từ' },
    of: { ipa: '/ʌv/', pos: 'prep', vi: 'của' },
    with: { ipa: '/wɪð/', pos: 'prep', vi: 'với' },
    without: { ipa: '/wɪˈðaʊt/', pos: 'prep', vi: 'mà không có' },
    by: { ipa: '/baɪ/', pos: 'prep', vi: 'bởi / bằng cách' },
    about: { ipa: '/əˈbaʊt/', pos: 'prep', vi: 'về / khoảng' },
    after: { ipa: '/ˈæf.tɚ/', pos: 'prep', vi: 'sau khi' },
    before: { ipa: '/bɪˈfɔːr/', pos: 'prep', vi: 'trước khi' },
    during: { ipa: '/ˈdʊr.ɪŋ/', pos: 'prep', vi: 'trong suốt' },
    into: { ipa: '/ˈɪn.tuː/', pos: 'prep', vi: 'vào trong' },
    over: { ipa: '/ˈoʊ.vɚ/', pos: 'prep', vi: 'hơn / qua' },
    under: { ipa: '/ˈʌn.dɚ/', pos: 'prep', vi: 'dưới' },
    between: { ipa: '/bɪˈtwiːn/', pos: 'prep', vi: 'giữa' },
    through: { ipa: '/θruː/', pos: 'prep', vi: 'xuyên qua / thông qua' },
    around: { ipa: '/əˈraʊnd/', pos: 'prep', vi: 'xung quanh / khoảng' },
    up: { ipa: '/ʌp/', pos: 'adv', vi: 'lên' },
    down: { ipa: '/daʊn/', pos: 'adv', vi: 'xuống' },
    out: { ipa: '/aʊt/', pos: 'adv', vi: 'ra ngoài' },
    off: { ipa: '/ɔːf/', pos: 'adv', vi: 'tắt / rời khỏi' },
    away: { ipa: '/əˈweɪ/', pos: 'adv', vi: 'xa / đi khỏi' },
    back: { ipa: '/bæk/', pos: 'adv', vi: 'trở lại / lưng' },
    now: { ipa: '/naʊ/', pos: 'adv', vi: 'bây giờ' },
    then: { ipa: '/ðen/', pos: 'adv', vi: 'sau đó / khi ấy' },
    today: { ipa: '/təˈdeɪ/', pos: 'adv', vi: 'hôm nay' },
    tonight: { ipa: '/təˈnaɪt/', pos: 'adv', vi: 'tối nay' },
    yesterday: { ipa: '/ˈjes.tɚ.deɪ/', pos: 'adv', vi: 'hôm qua' },
    tomorrow: { ipa: '/təˈmɑːr.oʊ/', pos: 'adv', vi: 'ngày mai' },
    always: { ipa: '/ˈɔːl.weɪz/', pos: 'adv', vi: 'luôn luôn' },
    usually: { ipa: '/ˈjuː.ʒu.ə.li/', pos: 'adv', vi: 'thường xuyên' },
    often: { ipa: '/ˈɔː.fən/', pos: 'adv', vi: 'thường' },
    sometimes: { ipa: '/ˈsʌm.taɪmz/', pos: 'adv', vi: 'thỉnh thoảng' },
    never: { ipa: '/ˈnev.ɚ/', pos: 'adv', vi: 'không bao giờ' },
    ever: { ipa: '/ˈev.ɚ/', pos: 'adv', vi: 'từng / bao giờ' },
    just: { ipa: '/dʒʌst/', pos: 'adv', vi: 'vừa mới / chỉ' },
    only: { ipa: '/ˈoʊn.li/', pos: 'adv', vi: 'chỉ / duy nhất' },
    also: { ipa: '/ˈɔːl.soʊ/', pos: 'adv', vi: 'cũng' },
    too: { ipa: '/tuː/', pos: 'adv', vi: 'cũng / quá' },
    very: { ipa: '/ˈver.i/', pos: 'adv', vi: 'rất' },
    really: { ipa: '/ˈriː.ə.li/', pos: 'adv', vi: 'thực sự / rất' },
    quite: { ipa: '/kwaɪt/', pos: 'adv', vi: 'khá là' },
    almost: { ipa: '/ˈɔːl.moʊst/', pos: 'adv', vi: 'hầu như / gần như' },
    still: { ipa: '/stɪl/', pos: 'adv', vi: 'vẫn còn' },
    already: { ipa: '/ɔːlˈred.i/', pos: 'adv', vi: 'đã ... rồi' },
    even: { ipa: '/ˈiː.vən/', pos: 'adv', vi: 'thậm chí' },
    well: { ipa: '/wel/', pos: 'adv', vi: 'tốt / khỏe / à thì' },
    much: { ipa: '/mʌtʃ/', pos: 'det', vi: 'nhiều' },
    many: { ipa: '/ˈmen.i/', pos: 'det', vi: 'nhiều' },
    more: { ipa: '/mɔːr/', pos: 'det', vi: 'nhiều hơn / thêm' },
    most: { ipa: '/moʊst/', pos: 'det', vi: 'nhất / hầu hết' },
    some: { ipa: '/sʌm/', pos: 'det', vi: 'một vài / một ít' },
    any: { ipa: '/ˈen.i/', pos: 'det', vi: 'bất kỳ' },
    every: { ipa: '/ˈev.ri/', pos: 'det', vi: 'mọi / mỗi' },
    each: { ipa: '/iːtʃ/', pos: 'det', vi: 'mỗi' },
    all: { ipa: '/ɔːl/', pos: 'det', vi: 'tất cả' },
    both: { ipa: '/boʊθ/', pos: 'det', vi: 'cả hai' },
    other: { ipa: '/ˈʌð.ɚ/', pos: 'adj', vi: 'khác' },
    another: { ipa: '/əˈnʌð.ɚ/', pos: 'det', vi: 'một cái khác' },
    no: { ipa: '/noʊ/', pos: 'det', vi: 'không' },
    not: { ipa: '/nɑːt/', pos: 'adv', vi: 'không' },
    yes: { ipa: '/jes/', pos: 'adv', vi: 'vâng / đúng vậy' },
    yeah: { ipa: '/jeə/', pos: 'adv', vi: 'ừ / vâng' },
    oh: { ipa: '/oʊ/', pos: 'intj', vi: 'ồ' },
    hi: { ipa: '/haɪ/', pos: 'intj', vi: 'xin chào' },
    hello: { ipa: '/həˈloʊ/', pos: 'intj', vi: 'xin chào' },

    // Động từ to be, trợ động từ & động từ cơ bản
    be: { ipa: '/biː/', pos: 'v', vi: 'thì / là / ở' },
    am: { ipa: '/æm/', pos: 'v', vi: 'là / đang' },
    is: { ipa: '/ɪz/', pos: 'v', vi: 'là / đang' },
    are: { ipa: '/ɑːr/', pos: 'v', vi: 'là / đang' },
    was: { ipa: '/wʌz/', pos: 'v', vi: 'đã là / đã ở' },
    were: { ipa: '/wɝː/', pos: 'v', vi: 'đã là / đã ở' },
    been: { ipa: '/bɪn/', pos: 'v', vi: 'đã từng' },
    being: { ipa: '/ˈbiː.ɪŋ/', pos: 'v', vi: 'đang là' },
    have: { ipa: '/hæv/', pos: 'v', vi: 'có / đã' },
    has: { ipa: '/hæz/', pos: 'v', vi: 'có / đã' },
    had: { ipa: '/hæd/', pos: 'v', vi: 'đã có' },
    having: { ipa: '/ˈhæv.ɪŋ/', pos: 'v', vi: 'đang có' },
    do: { ipa: '/duː/', pos: 'v', vi: 'làm / trợ động từ' },
    does: { ipa: '/dʌz/', pos: 'v', vi: 'làm / trợ động từ' },
    did: { ipa: '/dɪd/', pos: 'v', vi: 'đã làm' },
    "don't": { ipa: '/doʊnt/', pos: 'v', vi: 'không' },
    "doesn't": { ipa: '/ˈdʌz.ənt/', pos: 'v', vi: 'không' },
    "didn't": { ipa: '/ˈdɪd.ənt/', pos: 'v', vi: 'đã không' },
    can: { ipa: '/kæn/', pos: 'v', vi: 'có thể' },
    "can't": { ipa: '/kænt/', pos: 'v', vi: 'không thể' },
    cannot: { ipa: '/ˈkæn.ɑːt/', pos: 'v', vi: 'không thể' },
    could: { ipa: '/kʊd/', pos: 'v', vi: 'có thể (quá khứ / lịch sự)' },
    will: { ipa: '/wɪl/', pos: 'v', vi: 'sẽ' },
    would: { ipa: '/wʊd/', pos: 'v', vi: 'sẽ / muốn' },
    should: { ipa: '/ʃʊd/', pos: 'v', vi: 'nên' },
    must: { ipa: '/mʌst/', pos: 'v', vi: 'phải / chắc hẳn' },
    may: { ipa: '/meɪ/', pos: 'v', vi: 'có thể / có lẽ' },
    might: { ipa: '/maɪt/', pos: 'v', vi: 'có lẽ' },

    // Bài 1: ELLLO #50 - Jill from Australia (What are you wearing today?)
    everyone: { ipa: '/ˈev.ri.wʌn/', pos: 'pron', vi: 'mọi người' },
    name: { ipa: '/neɪm/', pos: 'n', vi: 'tên' },
    "name's": { ipa: '/neɪmz/', pos: 'phr', vi: 'tên là' },
    jill: { ipa: '/dʒɪl/', pos: 'n', vi: 'Jill (tên riêng)' },
    australia: { ipa: '/ɔːˈstreɪl.jə/', pos: 'n', vi: 'nước Úc' },
    question: { ipa: '/ˈkwes.tʃən/', pos: 'n', vi: 'câu hỏi' },
    wearing: { ipa: '/ˈwer.ɪŋ/', pos: 'v', vi: 'đang mặc' },
    wear: { ipa: '/wer/', pos: 'v', vi: 'mặc / đội / đeo' },
    actually: { ipa: '/ˈæk.tʃu.ə.li/', pos: 'adv', vi: 'thực ra / thật sự' },
    excited: { ipa: '/ɪkˈsaɪ.t̬ɪd/', pos: 'adj', vi: 'hào hứng / phấn khích' },
    answer: { ipa: '/ˈæn.sɚ/', pos: 'v/n', vi: 'trả lời / câu trả lời' },
    favorite: { ipa: '/ˈfeɪ.vər.ɪt/', pos: 'adj', vi: 'yêu thích nhất' },
    favourite: { ipa: '/ˈfeɪ.vər.ɪt/', pos: 'adj', vi: 'yêu thích nhất' },
    "t-shirt": { ipa: '/ˈtiː.ʃɝːt/', pos: 'n', vi: 'áo phông / áo thun' },
    tshirt: { ipa: '/ˈtiː.ʃɝːt/', pos: 'n', vi: 'áo phông' },
    shirt: { ipa: '/ʃɝːt/', pos: 'n', vi: 'áo sơ mi / áo' },
    recent: { ipa: '/ˈriː.sənt/', pos: 'adj', vi: 'gần đây' },
    holiday: { ipa: '/ˈhɑː.lə.deɪ/', pos: 'n', vi: 'kỳ nghỉ' },
    shade: { ipa: '/ʃeɪd/', pos: 'n', vi: 'tông màu / sắc độ' },
    green: { ipa: '/ɡriːn/', pos: 'n/adj', vi: 'màu xanh lá cây' },
    love: { ipa: '/lʌv/', pos: 'v/n', vi: 'yêu thích' },
    reminds: { ipa: '/rɪˈmaɪndz/', pos: 'v', vi: 'gợi nhớ / nhắc nhở' },
    remind: { ipa: '/rɪˈmaɪnd/', pos: 'v', vi: 'nhắc nhở / gợi nhớ' },
    forest: { ipa: '/ˈfɔːr.ɪst/', pos: 'n', vi: 'khu rừng' },
    says: { ipa: '/sez/', pos: 'v', vi: 'nói rằng / có ghi dòng chữ' },
    say: { ipa: '/seɪ/', pos: 'v', vi: 'nói' },
    said: { ipa: '/sed/', pos: 'v', vi: 'đã nói' },
    fight: { ipa: '/faɪt/', pos: 'v/n', vi: 'chiến đấu / chống lại' },
    ride: { ipa: '/raɪd/', pos: 'v/n', vi: 'cưỡi (sóng) / lái' },
    picture: { ipa: '/ˈpɪk.tʃɚ/', pos: 'n', vi: 'bức tranh / hình ảnh' },
    girl: { ipa: '/ɡɝːl/', pos: 'n', vi: 'cô gái' },
    riding: { ipa: '/ˈraɪ.dɪŋ/', pos: 'v', vi: 'đang cưỡi (sóng)' },
    wave: { ipa: '/weɪv/', pos: 'n', vi: 'ngọn sóng' },
    perfect: { ipa: '/ˈpɝː.fekt/', pos: 'adj', vi: 'hoàn hảo' },
    went: { ipa: '/went/', pos: 'v', vi: 'đã đi' },
    go: { ipa: '/ɡoʊ/', pos: 'v', vi: 'đi' },
    going: { ipa: '/ˈɡoʊ.ɪŋ/', pos: 'v', vi: 'đang đi / sắp' },
    surfing: { ipa: '/ˈsɝː.fɪŋ/', pos: 'n/v', vi: 'môn lướt sóng' },
    surf: { ipa: '/sɝːf/', pos: 'v/n', vi: 'lướt sóng' },
    camp: { ipa: '/kæmp/', pos: 'n', vi: 'trại huấn luyện / khu cắm trại' },
    learned: { ipa: '/lɝːnd/', pos: 'v', vi: 'đã học được' },
    learn: { ipa: '/lɝːn/', pos: 'v', vi: 'học' },
    fun: { ipa: '/fʌn/', pos: 'n/adj', vi: 'vui vẻ / thú vị' },
    great: { ipa: '/ɡreɪt/', pos: 'adj', vi: 'tuyệt vời / lớn' },
    challenge: { ipa: '/ˈtʃæl.ɪndʒ/', pos: 'n/v', vi: 'thử thách' },
    time: { ipa: '/taɪm/', pos: 'n', vi: 'thời gian / lần' },
    times: { ipa: '/taɪmz/', pos: 'n', vi: 'lần / thời điểm' },
    remember: { ipa: '/rɪˈmem.bɚ/', pos: 'v', vi: 'nhớ lại / ghi nhớ' },
    wonderful: { ipa: '/ˈwʌn.dɚ.fəl/', pos: 'adj', vi: 'tuyệt vời / kỳ diệu' },
    trip: { ipa: '/trɪp/', pos: 'n', vi: 'chuyến đi' },

    // Bài 2: BBC Learning English - Easy English Conversations (Daily Routine & Swimming)
    wake: { ipa: '/weɪk/', pos: 'v', vi: 'thức giấc' },
    get: { ipa: '/ɡet/', pos: 'v', vi: 'thức dậy / nhận được / trở nên' },
    gets: { ipa: '/ɡets/', pos: 'v', vi: 'nhận được / trở nên' },
    got: { ipa: '/ɡɑːt/', pos: 'v', vi: 'đã có / đã nhận' },
    early: { ipa: '/ˈɝː.li/', pos: 'adj/adv', vi: 'sớm' },
    seven: { ipa: '/ˈsev.ən/', pos: 'num', vi: 'số bảy (7)' },
    "o'clock": { ipa: '/əˈklɑːk/', pos: 'adv', vi: 'giờ đúng' },
    eight: { ipa: '/eɪt/', pos: 'num', vi: 'số tám (8)' },
    nine: { ipa: '/naɪn/', pos: 'num', vi: 'số chín (9)' },
    ten: { ipa: '/ten/', pos: 'num', vi: 'số mười (10)' },
    six: { ipa: '/sɪks/', pos: 'num', vi: 'số sáu (6)' },
    five: { ipa: '/faɪv/', pos: 'num', vi: 'số năm (5)' },
    four: { ipa: '/fɔːr/', pos: 'num', vi: 'số bốn (4)' },
    three: { ipa: '/θriː/', pos: 'num', vi: 'số ba (3)' },
    two: { ipa: '/tuː/', pos: 'num', vi: 'số hai (2)' },
    one: { ipa: '/wʌn/', pos: 'num', vi: 'một (1)' },
    first: { ipa: '/fɝːst/', pos: 'adj/adv', vi: 'đầu tiên / trước hết' },
    second: { ipa: '/ˈsek.ənd/', pos: 'adj/n', vi: 'thứ hai / giây' },
    third: { ipa: '/θɝːd/', pos: 'adj', vi: 'thứ ba' },
    cup: { ipa: '/kʌp/', pos: 'n', vi: 'tách / cốc' },
    tea: { ipa: '/tiː/', pos: 'n', vi: 'trà' },
    coffee: { ipa: '/ˈkɔː.fi/', pos: 'n', vi: 'cà phê' },
    breakfast: { ipa: '/ˈbrek.fəst/', pos: 'n', vi: 'bữa sáng' },
    lunch: { ipa: '/lʌntʃ/', pos: 'n', vi: 'bữa trưa' },
    dinner: { ipa: '/ˈdɪn.ɚ/', pos: 'n', vi: 'bữa tối' },
    work: { ipa: '/wɝːk/', pos: 'v/n', vi: 'làm việc / công việc' },
    working: { ipa: '/ˈwɝː.kɪŋ/', pos: 'v', vi: 'đang làm việc' },
    home: { ipa: '/hoʊm/', pos: 'n/adv', vi: 'nhà / ở nhà' },
    office: { ipa: '/ˈɔː.fɪs/', pos: 'n', vi: 'văn phòng' },
    commute: { ipa: '/kəˈmjuːt/', pos: 'v/n', vi: 'đi làm hằng ngày' },
    walk: { ipa: '/wɔːk/', pos: 'v/n', vi: 'đi bộ' },
    walking: { ipa: '/ˈwɔː.kɪŋ/', pos: 'v/n', vi: 'việc đi bộ' },
    park: { ipa: '/pɑːrk/', pos: 'n', vi: 'công viên' },
    fresh: { ipa: '/freʃ/', pos: 'adj', vi: 'trong lành / tươi mới' },
    air: { ipa: '/er/', pos: 'n', vi: 'không khí' },
    morning: { ipa: '/ˈmɔːr.nɪŋ/', pos: 'n', vi: 'buổi sáng' },
    afternoon: { ipa: '/ˌæf.tɚˈnuːn/', pos: 'n', vi: 'buổi chiều' },
    evening: { ipa: '/ˈiːv.nɪŋ/', pos: 'n', vi: 'buổi tối' },
    night: { ipa: '/naɪt/', pos: 'n', vi: 'ban đêm' },
    weekend: { ipa: '/ˈwiːk.end/', pos: 'n', vi: 'cuối tuần' },
    week: { ipa: '/wiːk/', pos: 'n', vi: 'tuần lễ' },
    day: { ipa: '/deɪ/', pos: 'n', vi: 'ngày' },
    days: { ipa: '/deɪz/', pos: 'n', vi: 'những ngày' },
    hour: { ipa: '/aʊər/', pos: 'n', vi: 'giờ đồng hồ' },
    hours: { ipa: '/aʊərz/', pos: 'n', vi: 'những giờ đồng hồ' },
    minute: { ipa: '/ˈmɪn.ɪt/', pos: 'n', vi: 'phút' },
    minutes: { ipa: '/ˈmɪn.ɪts/', pos: 'n', vi: 'những phút' },
    swimming: { ipa: '/ˈswɪm.ɪŋ/', pos: 'n', vi: 'môn bơi lội' },
    swim: { ipa: '/swɪm/', pos: 'v', vi: 'bơi' },
    pool: { ipa: '/puːl/', pos: 'n', vi: 'hồ bơi' },
    local: { ipa: '/ˈloʊ.kəl/', pos: 'adj', vi: 'địa phương / gần nhà' },
    exercise: { ipa: '/ˈek.sɚ.saɪz/', pos: 'n/v', vi: 'tập thể dục / bài tập' },
    active: { ipa: '/ˈæk.tɪv/', pos: 'adj', vi: 'năng động / tích cực' },
    relaxed: { ipa: '/rɪˈlækst/', pos: 'adj', vi: 'thư giãn / thoải mái' },
    relax: { ipa: '/rɪˈlæks/', pos: 'v', vi: 'thư giãn' },
    energy: { ipa: '/ˈen.ɚ.dʒi/', pos: 'n', vi: 'năng lượng' },
    start: { ipa: '/stɑːrt/', pos: 'v/n', vi: 'bắt đầu' },
    started: { ipa: '/ˈstɑːr.t̬ɪd/', pos: 'v', vi: 'đã bắt đầu' },
    finish: { ipa: '/ˈfɪn.ɪʃ/', pos: 'v', vi: 'kết thúc / hoàn thành' },
    help: { ipa: '/help/', pos: 'v/n', vi: 'giúp đỡ' },
    helps: { ipa: '/helps/', pos: 'v', vi: 'giúp cho' },
    feel: { ipa: '/fiːl/', pos: 'v', vi: 'cảm thấy' },
    feeling: { ipa: '/ˈfiː.lɪŋ/', pos: 'n/v', vi: 'cảm giác / đang cảm thấy' },
    better: { ipa: '/ˈbet̬.ɚ/', pos: 'adj/adv', vi: 'tốt hơn / khỏe hơn' },
    best: { ipa: '/best/', pos: 'adj', vi: 'tốt nhất' },
    good: { ipa: '/ɡʊd/', pos: 'adj', vi: 'tốt' },
    clear: { ipa: '/klɪr/', pos: 'v/adj', vi: 'làm tỉnh táo / rõ ràng' },
    mind: { ipa: '/maɪnd/', pos: 'n', vi: 'tâm trí / đầu óc' },
    routine: { ipa: '/ruːˈtiːn/', pos: 'n', vi: 'thói quen sinh hoạt hằng ngày' },
    daily: { ipa: '/ˈdeɪ.li/', pos: 'adj', vi: 'hằng ngày' },
    habit: { ipa: '/ˈhæb.ɪt/', pos: 'n', vi: 'thói quen' },
    habits: { ipa: '/ˈhæb.ɪts/', pos: 'n', vi: 'những thói quen' },

    // Bài 3, 4, 5, 6: Từ vựng Y khoa & Sức khỏe VSTEP B1-B2
    good: { ipa: '/ɡʊd/', pos: 'adj', vi: 'tốt' },
    doctor: { ipa: '/ˈdɑːk.tɚ/', pos: 'n', vi: 'bác sĩ' },
    patient: { ipa: '/ˈpeɪ.ʃənt/', pos: 'n', vi: 'bệnh nhân' },
    patients: { ipa: '/ˈpeɪ.ʃənts/', pos: 'n', vi: 'các bệnh nhân' },
    bring: { ipa: '/brɪŋ/', pos: 'v', vi: 'đưa đến / mang lại' },
    brings: { ipa: '/brɪŋz/', pos: 'v', vi: 'mang đến / đưa đến' },
    clinic: { ipa: '/ˈklɪn.ɪk/', pos: 'n', vi: 'phòng khám' },
    hospital: { ipa: '/ˈhɑː.spɪ.t̬əl/', pos: 'n', vi: 'bệnh viện' },
    persistent: { ipa: '/pɚˈsɪs.tənt/', pos: 'adj', vi: 'dai dẳng, kéo dài' },
    cough: { ipa: '/kɔːf/', pos: 'n/v', vi: 'ho / cơn ho' },
    fever: { ipa: '/ˈfiː.vɚ/', pos: 'n', vi: 'sốt' },
    low: { ipa: '/loʊ/', pos: 'adj', vi: 'thấp / nhẹ' },
    grade: { ipa: '/ɡreɪd/', pos: 'n', vi: 'mức độ / cấp độ' },
    "low-grade": { ipa: '/ˌloʊˈɡreɪd/', pos: 'adj', vi: 'mức độ nhẹ (sốt nhẹ)' },
    notice: { ipa: '/ˈnoʊ.t̬ɪs/', pos: 'v', vi: 'nhận thấy / chú ý' },
    symptoms: { ipa: '/ˈsɪmp.təmz/', pos: 'n', vi: 'các triệu chứng' },
    symptom: { ipa: '/ˈsɪmp.təm/', pos: 'n', vi: 'triệu chứng' },
    mild: { ipa: '/maɪld/', pos: 'adj', vi: 'nhẹ / êm dịu' },
    sore: { ipa: '/sɔːr/', pos: 'adj', vi: 'đau rát / nhức' },
    throat: { ipa: '/θroʊt/', pos: 'n', vi: 'cổ họng' },
    gradually: { ipa: '/ˈɡrædʒ.u.ə.li/', pos: 'adv', vi: 'dần dần, từ từ' },
    worse: { ipa: '/wɝːs/', pos: 'adj', vi: 'tệ hơn / nặng hơn' },
    worsened: { ipa: '/ˈwɝː.sənd/', pos: 'v', vi: 'đã trở nặng hơn' },
    shortness: { ipa: '/ˈʃɔːrt.nəs/', pos: 'n', vi: 'sự hụt / sự thiếu' },
    breath: { ipa: '/breθ/', pos: 'n', vi: 'hơi thở' },
    breathe: { ipa: '/briːð/', pos: 'v', vi: 'hít thở' },
    deep: { ipa: '/diːp/', pos: 'adj', vi: 'sâu' },
    chest: { ipa: '/tʃest/', pos: 'n', vi: 'lồng ngực' },
    tight: { ipa: '/taɪt/', pos: 'adj', vi: 'tức / căng chặt' },
    climb: { ipa: '/klaɪm/', pos: 'v', vi: 'leo / bước lên' },
    stairs: { ipa: '/sterz/', pos: 'n', vi: 'cầu thang' },
    listen: { ipa: '/ˈlɪs.ən/', pos: 'v', vi: 'lắng nghe / nghe phổi' },
    lungs: { ipa: '/lʌŋz/', pos: 'n', vi: 'hai lá phổi' },
    lung: { ipa: '/lʌŋ/', pos: 'n', vi: 'lá phổi' },
    check: { ipa: '/tʃek/', pos: 'v/n', vi: 'kiểm tra' },
    oxygen: { ipa: '/ˈɑːk.sɪ.dʒən/', pos: 'n', vi: 'ô-xy' },
    saturation: { ipa: '/ˌsætʃ.əˈreɪ.ʃən/', pos: 'n', vi: 'độ bão hòa' },
    immediately: { ipa: '/ɪˈmiː.di.ət.li/', pos: 'adv', vi: 'ngay lập tức' },
    let: { ipa: '/let/', pos: 'v', vi: 'hãy để' },
    take: { ipa: '/teɪk/', pos: 'v', vi: 'hít / lấy / uống (thuốc)' },
    takes: { ipa: '/teɪks/', pos: 'v', vi: 'mất (thời gian) / lấy' },
    taking: { ipa: '/ˈteɪ.kɪŋ/', pos: 'v', vi: 'đang dùng / đang lấy' },
    healthy: { ipa: '/ˈhel.θi/', pos: 'adj', vi: 'khỏe mạnh / lành mạnh' },
    health: { ipa: '/helθ/', pos: 'n', vi: 'sức khỏe' },
    keep: { ipa: '/kiːp/', pos: 'v', vi: 'giữ / duy trì' },
    shape: { ipa: '/ʃeɪp/', pos: 'n', vi: 'vóc dáng / thể trạng' },
    busy: { ipa: '/ˈbɪz.i/', pos: 'adj', vi: 'bận rộn' },
    honestly: { ipa: '/ˈɑː.nɪst.li/', pos: 'adv', vi: 'thành thật mà nói' },
    used: { ipa: '/juːst/', pos: 'v/adj', vi: 'đã từng / quen với' },
    skip: { ipa: '/skɪp/', pos: 'v', vi: 'bỏ qua (bữa ăn)' },
    drink: { ipa: '/drɪŋk/', pos: 'v/n', vi: 'uống / đồ uống' },
    exhausted: { ipa: '/ɪɡˈzɔː.stɪd/', pos: 'adj', vi: 'kiệt sức, mệt lả' },
    changed: { ipa: '/tʃeɪndʒd/', pos: 'v', vi: 'đã thay đổi' },
    change: { ipa: '/tʃeɪndʒ/', pos: 'v/n', vi: 'thay đổi' },
    realized: { ipa: '/ˈriː.ə.laɪzd/', pos: 'v', vi: 'nhận ra rằng' },
    sleep: { ipa: '/sliːp/', pos: 'n/v', vi: 'giấc ngủ / ngủ' },
    balanced: { ipa: '/ˈbæl.ənst/', pos: 'adj', vi: 'cân bằng' },
    diet: { ipa: '/ˈdaɪ.ət/', pos: 'n', vi: 'chế độ ăn uống' },
    essential: { ipa: '/ɪˈsen.ʃəl/', pos: 'adj', vi: 'thiết yếu / cốt lõi' },
    concentration: { ipa: '/ˌkɑːn.sənˈtreɪ.ʃən/', pos: 'n', vi: 'sự tập trung' },
    prepare: { ipa: '/prɪˈper/', pos: 'v', vi: 'chuẩn bị' },
    oatmeal: { ipa: '/ˈoʊt.miːl/', pos: 'n', vi: 'cháo yến mạch' },
    fruit: { ipa: '/fruːt/', pos: 'n', vi: 'trái cây' },
    campus: { ipa: '/ˈkæm.pəs/', pos: 'n', vi: 'khuôn viên trường đại học' },
    instead: { ipa: '/ɪnˈsted/', pos: 'adv', vi: 'thay vì' },
    bus: { ipa: '/bʌs/', pos: 'n', vi: 'xe buýt' },
    simple: { ipa: '/ˈsɪm.pəl/', pos: 'adj', vi: 'đơn giản' },
    improved: { ipa: '/ɪmˈpruːvd/', pos: 'v', vi: 'đã cải thiện' },
    mental: { ipa: '/ˈmen.təl/', pos: 'adj', vi: 'thuộc về tinh thần / trí óc' },
    clarity: { ipa: '/ˈkler.ə.t̬i/', pos: 'n', vi: 'sự minh mẫn, sáng suốt' },
    presenting: { ipa: '/prɪˈzen.tɪŋ/', pos: 'v', vi: 'nhập viện với biểu hiện' },
    severe: { ipa: '/səˈvɪr/', pos: 'adj', vi: 'dữ dội / nghiêm trọng' },
    abdominal: { ipa: '/æbˈdɑː.mɪ.nəl/', pos: 'adj', vi: 'thuộc vùng bụng' },
    pain: { ipa: '/peɪn/', pos: 'n', vi: 'cơn đau' },
    migrated: { ipa: '/ˈmaɪ.ɡreɪ.t̬ɪd/', pos: 'v', vi: 'khu trú / di chuyển đến' },
    right: { ipa: '/raɪt/', pos: 'adj/adv', vi: 'bên phải / đúng' },
    lower: { ipa: '/ˈloʊ.ɚ/', pos: 'adj', vi: 'phía dưới / hạ thấp' },
    quadrant: { ipa: '/ˈkwɑː.drənt/', pos: 'n', vi: 'góc phần tư (vùng hố chậu)' },
    onset: { ipa: '/ˈɑːn.set/', pos: 'n', vi: 'sự khởi phát' },
    occurred: { ipa: '/əˈkɝːd/', pos: 'v', vi: 'đã xảy ra' },
    approximately: { ipa: '/əˈprɑːk.sə.mət.li/', pos: 'adv', vi: 'xấp xỉ / khoảng chừng' },
    twelve: { ipa: '/twelv/', pos: 'num', vi: 'mười hai (12)' },
    ago: { ipa: '/əˈɡoʊ/', pos: 'adv', vi: 'trước đây' },
    accompanied: { ipa: '/əˈkʌm.pə.nid/', pos: 'v', vi: 'đi kèm với' },
    nausea: { ipa: '/ˈnɔː.zi.ə/', pos: 'n', vi: 'buồn nôn' },
    anorexia: { ipa: '/ˌæn.əˈrek.si.ə/', pos: 'n', vi: 'chán ăn' },
    physical: { ipa: '/ˈfɪz.ɪ.kəl/', pos: 'adj', vi: 'thể chất / thực thể' },
    examination: { ipa: '/ɪɡˌzæm.əˈneɪ.ʃən/', pos: 'n', vi: 'khám lâm sàng / kỳ thi' },
    reveals: { ipa: '/rɪˈviːlz/', pos: 'v', vi: 'cho thấy / bộc lộ' },
    marked: { ipa: '/mɑːrkt/', pos: 'adj', vi: 'rõ rệt' },
    rebound: { ipa: '/ˈriː.baʊnd/', pos: 'n', vi: 'phản ứng dội ngược' },
    tenderness: { ipa: '/ˈten.dɚ.nəs/', pos: 'n', vi: 'đau chói khi ấn' },
    guarding: { ipa: '/ˈɡɑːr.dɪŋ/', pos: 'n', vi: 'co cứng thành bụng' },
    laboratory: { ipa: '/ˈlæb.rə.tɔːr.i/', pos: 'n', vi: 'phòng xét nghiệm' },
    findings: { ipa: '/ˈfaɪn.dɪŋz/', pos: 'n', vi: 'kết quả cận lâm sàng' },
    indicate: { ipa: '/ˈɪn.dɪ.keɪt/', pos: 'v', vi: 'chỉ ra / cho thấy' },
    leukocytosis: { ipa: '/ˌluː.koʊ.saɪˈtoʊ.sɪs/', pos: 'n', vi: 'tăng bạch cầu' },
    elevated: { ipa: '/ˈel.ə.veɪ.t̬ɪd/', pos: 'adj', vi: 'tăng cao' },
    neutrophil: { ipa: '/ˈnuː.trə.fɪl/', pos: 'n', vi: 'bạch cầu đa nhân trung tính' },
    count: { ipa: '/kaʊnt/', pos: 'n/v', vi: 'số lượng / chỉ số đếm' },
    urgent: { ipa: '/ˈɝː.dʒənt/', pos: 'adj', vi: 'khẩn cấp' },
    ultrasound: { ipa: '/ˈʌl.trə.saʊnd/', pos: 'n', vi: 'siêu âm' },
    surgical: { ipa: '/ˈsɝː.dʒɪ.kəl/', pos: 'adj', vi: 'ngoại khoa / phẫu thuật' },
    consultation: { ipa: '/ˌkɑːn.sʌlˈteɪ.ʃən/', pos: 'n', vi: 'hội chẩn / khám tư vấn' },
    warranted: { ipa: '/ˈwɔːr.ən.t̬ɪd/', pos: 'adj', vi: 'cần thiết / có chỉ định' },
    prevent: { ipa: '/prɪˈvent/', pos: 'v', vi: 'ngăn ngừa' },
    perforation: { ipa: '/ˌpɝː.fəˈreɪ.ʃən/', pos: 'n', vi: 'thủng tạng (vỡ ruột thừa)' },
    telemedicine: { ipa: '/ˌtel.əˈmed.ɪ.sɪn/', pos: 'n', vi: 'y học từ xa' },
    transformed: { ipa: '/trænsˈfɔːrmd/', pos: 'v', vi: 'đã chuyển đổi mạnh mẽ' },
    how: { ipa: '/haʊ/', pos: 'adv', vi: 'cách thức / như thế nào' },
    access: { ipa: '/ˈæk.ses/', pos: 'v/n', vi: 'tiếp cận' },
    primary: { ipa: '/ˈpraɪ.mer.i/', pos: 'adj', vi: 'ban đầu / cơ sở' },
    healthcare: { ipa: '/ˈhelθ.ker/', pos: 'n', vi: 'chăm sóc sức khỏe' },
    remote: { ipa: '/rɪˈmoʊt/', pos: 'adj', vi: 'từ xa / vùng sâu vùng xa' },
    regions: { ipa: '/ˈriː.dʒənz/', pos: 'n', vi: 'các khu vực / vùng miền' },
    however: { ipa: '/haʊˈev.ɚ/', pos: 'adv', vi: 'tuy nhiên' },
    prescribing: { ipa: '/prɪˈskraɪ.bɪŋ/', pos: 'v/n', vi: 'việc kê đơn thuốc' },
    antibiotics: { ipa: '/ˌæn.t̬i.baɪˈɑː.t̬ɪks/', pos: 'n', vi: 'thuốc kháng sinh' },
    diagnostic: { ipa: '/ˌdaɪ.əɡˈnɑː.stɪk/', pos: 'adj', vi: 'thuộc chẩn đoán' },
    testing: { ipa: '/ˈtes.tɪŋ/', pos: 'n', vi: 'xét nghiệm' },
    poses: { ipa: '/ˈpoʊ.zɪz/', pos: 'v', vi: 'đặt ra / gây ra' },
    significant: { ipa: '/sɪɡˈnɪf.ə.kənt/', pos: 'adj', vi: 'đáng kể / quan trọng' },
    risks: { ipa: '/rɪsks/', pos: 'n', vi: 'những rủi ro / nguy cơ' },
    antimicrobial: { ipa: '/ˌæn.t̬i.maɪˈkroʊ.bi.əl/', pos: 'adj', vi: 'kháng vi sinh vật' },
    resistance: { ipa: '/rɪˈzɪs.təns/', pos: 'n', vi: 'sự đề kháng (kháng thuốc)' },
    occurs: { ipa: '/əˈkɝːz/', pos: 'v', vi: 'xảy ra' },
    bacteria: { ipa: '/bækˈtɪr.i.ə/', pos: 'n', vi: 'vi khuẩn' },
    adapt: { ipa: '/əˈdæpt/', pos: 'v', vi: 'thích nghi / biến đổi' },
    misused: { ipa: '/ˌmɪsˈjuːzd/', pos: 'adj/v', vi: 'bị lạm dụng / dùng sai cách' },
    medications: { ipa: '/ˌmed.əˈkeɪ.ʃənz/', pos: 'n', vi: 'các loại thuốc điều trị' },
    clinicians: { ipa: '/klɪˈnɪʃ.ənz/', pos: 'n', vi: 'các bác sĩ lâm sàng' },
    adhere: { ipa: '/ədˈhɪr/', pos: 'v', vi: 'tuân thủ chặt chẽ' },
    strict: { ipa: '/strɪkt/', pos: 'adj', vi: 'nghiêm ngặt' },
    evidence: { ipa: '/ˈev.ə.dəns/', pos: 'n', vi: 'bằng chứng / y học thực chứng' },
    "evidence-based": { ipa: '/ˈev.ə.dəns.beɪst/', pos: 'adj', vi: 'dựa trên bằng chứng khoa học' },
    guidelines: { ipa: '/ˈɡaɪd.laɪnz/', pos: 'n', vi: 'phác đồ / hướng dẫn điều trị' },
    virtual: { ipa: '/ˈvɝː.tʃu.əl/', pos: 'adj', vi: 'trực tuyến / ảo' },
    consultations: { ipa: '/ˌkɑːn.sʌlˈteɪ.ʃənz/', pos: 'n', vi: 'các buổi khám tư vấn' },
    maintaining: { ipa: '/meɪnˈteɪ.nɪŋ/', pos: 'v', vi: 'việc duy trì' },
    maintain: { ipa: '/meɪnˈteɪn/', pos: 'v', vi: 'duy trì' },
    way: { ipa: '/weɪ/', pos: 'n', vi: 'cách thức / con đường' },
    boost: { ipa: '/buːst/', pos: 'v/n', vi: 'tăng cường / thúc đẩy' },
    thirty: { ipa: '/ˈθɝː.t̬i/', pos: 'num', vi: 'ba mươi (30)' },
    gives: { ipa: '/ɡɪvz/', pos: 'v', vi: 'mang lại / cho' },
    give: { ipa: '/ɡɪv/', pos: 'v', vi: 'cho / mang lại' },
    make: { ipa: '/meɪk/', pos: 'v', vi: 'pha / tạo ra / làm' },
    past: { ipa: '/pæst/', pos: 'adj/n', vi: 'vừa qua / quá khứ' },
    please: { ipa: '/pliːz/', pos: 'intj', vi: 'vui lòng / xin hãy' },
    schedule: { ipa: '/ˈskedʒ.uːl/', pos: 'n/v', vi: 'lịch trình' },
    such: { ipa: '/sʌtʃ/', pos: 'det', vi: 'như vậy / đến thế' },
    felt: { ipa: '/felt/', pos: 'v', vi: 'đã cảm thấy' },
    last: { ipa: '/læst/', pos: 'adj', vi: 'vừa qua / cuối cùng' },
    month: { ipa: '/mʌnθ/', pos: 'n', vi: 'tháng' },
    sounds: { ipa: '/saʊndz/', pos: 'v', vi: 'nghe có vẻ' },
    like: { ipa: '/laɪk/', pos: 'prep/v', vi: 'như là / thích' },
    improve: { ipa: '/ɪmˈpruːv/', pos: 'v', vi: 'cải thiện' },
    proper: { ipa: '/ˈprɑː.pɚ/', pos: 'adj', vi: 'đúng chuẩn / xác đáng' },
    therefore: { ipa: '/ˈðer.fɔːr/', pos: 'adv', vi: 'do đó / vì vậy' },
    especially: { ipa: '/ɪˈspeʃ.əl.i/', pos: 'adv', vi: 'đặc biệt là' },
    new: { ipa: '/nuː/', pos: 'adj', vi: 'mới' },
    ocean: { ipa: '/ˈoʊ.ʃən/', pos: 'n', vi: 'đại dương / biển cả' },
    lesya: { ipa: '/ˈle.sjə/', pos: 'n', vi: 'Lesya (tên riêng)' },
    lisa: { ipa: '/ˈliː.sə/', pos: 'n', vi: 'Lisa (tên riêng)' },
    ukraine: { ipa: '/juːˈkreɪn/', pos: 'n', vi: 'đất nước Ukraine' },
    poland: { ipa: '/ˈpoʊ.lənd/', pos: 'n', vi: 'đất nước Ba Lan' },
    live: { ipa: '/lɪv/', pos: 'v', vi: 'sinh sống / ở' },
    lives: { ipa: '/lɪvz/', pos: 'v', vi: 'sinh sống' },
    living: { ipa: '/ˈlɪv.ɪŋ/', pos: 'v/n', vi: 'đang sinh sống' },
    eleven: { ipa: '/ɪˈlev.ən/', pos: 'num', vi: 'mười một (11)' },
    "11:30": { ipa: '/ɪˈlev.ən ˈθɝː.t̬i/', pos: 'num', vi: '11 giờ 30 phút' },
    "10:30": { ipa: '/ten ˈθɝː.t̬i/', pos: 'num', vi: '10 giờ 30 phút' },
    "a.m.": { ipa: '/ˌeɪˈem/', pos: 'adv', vi: 'buổi sáng (trước 12h trưa)' },
    "p.m.": { ipa: '/ˌpiːˈem/', pos: 'adv', vi: 'buổi chiều / tối' },
    difference: { ipa: '/ˈdɪf.ɚ.əns/', pos: 'n', vi: 'sự chênh lệch / khác biệt' },
    ahead: { ipa: '/əˈhed/', pos: 'adv', vi: 'sớm hơn / phía trước' },
    behind: { ipa: '/bɪˈhaɪnd/', pos: 'adv/prep', vi: 'muộn hơn / phía sau' },
    country: { ipa: '/ˈkʌn.tri/', pos: 'n', vi: 'đất nước / quốc gia' },
    countries: { ipa: '/ˈkʌn.triz/', pos: 'n', vi: 'các quốc gia' },
    visit: { ipa: '/ˈvɪz.ɪt/', pos: 'v/n', vi: 'thăm / chuyến thăm' },
    visiting: { ipa: '/ˈvɪz.ɪ.t̬ɪŋ/', pos: 'v', vi: 'đang ghé thăm' },
    family: { ipa: '/ˈfæm.ə.li/', pos: 'n', vi: 'gia đình' },
    buli: { ipa: '/ˈbuː.li/', pos: 'n', vi: 'Buli (tên người dẫn chương trình BBC)' },
    bully: { ipa: '/ˈbuː.li/', pos: 'n', vi: 'Buli (tên người dẫn chương trình BBC)' },
    sian: { ipa: '/ʃɑːn/', pos: 'n', vi: 'Sian (tên người dẫn chương trình BBC, đọc là /ʃɑːn/)' },
    georgie: { ipa: '/ˈdʒɔːr.dʒi/', pos: 'n', vi: 'Georgie (tên người dẫn chương trình BBC)' },
    tim: { ipa: '/tɪm/', pos: 'n', vi: 'Tim (tên người dẫn chương trình BBC)' },
    well: { ipa: '/wel/', pos: 'intj/adv', vi: 'à / tốt' },
    always: { ipa: '/ˈɔːl.weɪz/', pos: 'adv', vi: 'luôn luôn (100%)' },
    yoghurt: { ipa: '/ˈjoʊ.ɡɚt/', pos: 'n', vi: 'sữa chua' },
    yogurt: { ipa: '/ˈjoʊ.ɡɚt/', pos: 'n', vi: 'sữa chua' },
    jogging: { ipa: '/ˈdʒɑː.ɡɪŋ/', pos: 'n', vi: 'chạy bộ thể dục' },
    sometimes: { ipa: '/ˈsʌm.taɪmz/', pos: 'adv', vi: 'thỉnh thoảng (~50%)' },
    occasionally: { ipa: '/əˈkeɪ.ʒən.əl.i/', pos: 'adv', vi: 'đôi khi / thỉnh thoảng (~30%)' },
    film: { ipa: '/fɪlm/', pos: 'n', vi: 'bộ phim' },
    clothes: { ipa: '/kloʊðz/', pos: 'n', vi: 'quần áo / trang phục' },
    shopping: { ipa: '/ˈʃɑː.pɪŋ/', pos: 'n', vi: 'việc mua sắm' },
    hardly: { ipa: '/ˈhɑːrd.li/', pos: 'adv', vi: 'hầu như không (hardly ever: hiếm khi)' },
    ever: { ipa: '/ˈev.ɚ/', pos: 'adv', vi: 'bao giờ (hardly ever: hầu như chẳng bao giờ)' },
    skateboarding: { ipa: '/ˈskeɪt.bɔːr.dɪŋ/', pos: 'n', vi: 'môn trượt ván' },
    never: { ipa: '/ˈnev.ɚ/', pos: 'adv', vi: 'không bao giờ (0%)' },
    quarter: { ipa: '/ˈkwɔːr.t̬ɚ/', pos: 'n', vi: '15 phút (một phần tư giờ)' },
    six: { ipa: '/sɪks/', pos: 'num', vi: 'sáu (6)' },
    eight: { ipa: '/eɪt/', pos: 'num', vi: 'tám (8)' },
    half: { ipa: '/hæf/', pos: 'n/det', vi: 'rưỡi / một nửa (half past: giờ rưỡi)' },
    porridge: { ipa: '/ˈpɔːr.ɪdʒ/', pos: 'n', vi: 'cháo yến mạch' },
    podcast: { ipa: '/ˈpɑːd.kæst/', pos: 'n', vi: 'chương trình âm thanh podcast' },
    welcome: { ipa: '/ˈwel.kəm/', pos: 'intj/v', vi: 'chào mừng' },
    real: { ipa: '/ˈriː.əl/', pos: 'adj', vi: 'thực tế / thật' },
    cook: { ipa: '/kʊk/', pos: 'v/n', vi: 'nấu ăn' },
    dinner: { ipa: '/ˈdɪn.ɚ/', pos: 'n', vi: 'bữa tối' },
    play: { ipa: '/pleɪ/', pos: 'v', vi: 'chơi' },
    video: { ipa: '/ˈvɪd.i.oʊ/', pos: 'n', vi: 'video / trò chơi điện tử' },
    games: { ipa: '/ɡeɪmz/', pos: 'n', vi: 'các trò chơi' },
    sea: { ipa: '/siː/', pos: 'n', vi: 'biển' },
    cereal: { ipa: '/ˈsɪr.i.əl/', pos: 'n', vi: 'ngũ cốc ăn sáng' },
    read: { ipa: '/riːd/', pos: 'v', vi: 'đọc' },
    news: { ipa: '/nuːz/', pos: 'n', vi: 'tin tức / thời sự' },
    train: { ipa: '/treɪn/', pos: 'n', vi: 'tàu hỏa / tàu điện' },
    exercise: { ipa: '/ˈek.sɚ.saɪz/', pos: 'v/n', vi: 'tập thể dục' },
    tv: { ipa: '/ˌtiːˈviː/', pos: 'n', vi: 'ti-vi / truyền hình' },
    gym: { ipa: '/dʒɪm/', pos: 'n', vi: 'phòng tập thể hình (gym)' },
    toast: { ipa: '/toʊst/', pos: 'n', vi: 'bánh mì nướng' },
    brush: { ipa: '/brʌʃ/', pos: 'v', vi: 'chải / đánh (răng)' },
    teeth: { ipa: '/tiːθ/', pos: 'n', vi: 'răng' },
    book: { ipa: '/bʊk/', pos: 'n', vi: 'cuốn sách' },
    camping: { ipa: '/ˈkæm.pɪŋ/', pos: 'n', vi: 'cắm trại' },
    cartoons: { ipa: '/kɑːrˈtuːnz/', pos: 'n', vi: 'phim hoạt hình' }
  };

  // Danh sách bài học phân theo trình độ B1 & B2
  const LESSONS_B1 = [
    {
      id: 'b1-bbc-daily-routine',
      title: 'BBC Learning English — Talk About Your Habits (Episode 12)',
      source: 'BBC Learning English Video (Giọng người thật)',
      topic: 'VSTEP Part 1–2 • Daily Routine & Adverbs of Frequency',
      duration: '03:25',
      youtubeId: 'gCs4knrlnD4',
      vstepQuestions: [
        {
          id: 'q1',
          question: '1. What time does Buli always get up, and what does he usually have for breakfast?',
          questionVi: 'Buli luôn thức dậy lúc mấy giờ và anh ấy thường ăn gì vào bữa sáng?',
          options: [
            "A. He gets up at six o'clock and has toast for breakfast",
            "B. He always gets up at seven o'clock and usually has fruit and yogurt",
            "C. He gets up at eight o'clock and has cereal for breakfast",
            'D. He gets up at nine o\'clock and skips breakfast'
          ],
          answer: 1,
          evidenceIdx: 4,
          explain: 'Ở câu #5 và #6 trong video, Buli nói rõ: "Well, I always get up at seven o\'clock. I usually have fruit and yoghurt for breakfast." Đáp án đúng là B.'
        },
        {
          id: 'q2',
          question: '2. How often does Buli go clothes shopping and skateboarding?',
          questionVi: 'Mức độ thường xuyên đi mua sắm quần áo và chơi trượt ván của Buli là như thế nào?',
          options: [
            'A. He goes clothes shopping every weekend and skateboards daily',
            'B. He hardly ever goes clothes shopping and never goes skateboarding',
            'C. He always goes clothes shopping after swimming',
            'D. He occasionally goes skateboarding in the park'
          ],
          answer: 1,
          evidenceIdx: 9,
          explain: 'Ở câu #10 và #12 trong video, Buli trả lời: "No, I hardly ever go clothes shopping" và "No, I never go skateboarding." Đáp án đúng là B.'
        },
        {
          id: 'q3',
          question: '3. What does the second presenter do after work in the evening?',
          questionVi: 'Người dẫn chương trình thứ hai thường làm gì sau giờ làm việc vào buổi tối?',
          options: [
            'A. Always cooks dinner after work and occasionally plays video games',
            'B. Goes swimming in the sea and drinks hot tea',
            'C. Goes camping in the forest every night',
            'D. Watches cartoons until midnight'
          ],
          answer: 0,
          evidenceIdx: 17,
          explain: 'Ở câu #18 và #19 trong video: "I always cook dinner after work. And I occasionally play video games." Đáp án đúng là A.'
        },
        {
          id: 'q4',
          question: '4. What does Georgie always do while traveling on the train?',
          questionVi: 'Georgie luôn luôn làm gì khi đang di chuyển trên tàu?',
          options: [
            'A. She sleeps on the train',
            'B. She always reads the news on the train',
            'C. She plays video games on her phone',
            'D. She eats porridge on the train'
          ],
          answer: 1,
          evidenceIdx: 25,
          explain: 'Ở câu #26 trong video, Georgie chia sẻ: "I always read the news on the train." Đáp án đúng là B.'
        }
      ],
      transcript: [
        {
          start: 11.3,
          end: 13.2,
          speaker: 'Sian (BBC)',
          en: 'How often do you go swimming?',
          vi: 'Bạn có thường xuyên đi bơi không?'
        },
        {
          start: 13.2,
          end: 14.9,
          speaker: 'Sian (BBC)',
          en: 'Hello, Buli!',
          vi: 'Xin chào Buli!'
        },
        {
          start: 14.9,
          end: 16.3,
          speaker: 'Buli (BBC)',
          en: 'Hi, Sian!',
          vi: 'Chào Sian!'
        },
        {
          start: 16.3,
          end: 19.2,
          speaker: 'Sian (BBC)',
          en: 'What is your daily routine?',
          vi: 'Thói quen sinh hoạt hằng ngày của bạn là gì?'
        },
        {
          start: 19.2,
          end: 23.2,
          speaker: 'Buli (BBC)',
          en: "Well, I always get up at seven o'clock.",
          vi: 'À, tôi luôn luôn thức dậy vào lúc 7 giờ sáng.'
        },
        {
          start: 23.2,
          end: 28.5,
          speaker: 'Buli (BBC)',
          en: 'I usually have fruit and yogurt for breakfast.',
          vi: 'Tôi thường ăn trái cây và sữa chua cho bữa sáng.'
        },
        {
          start: 30.0,
          end: 33.2,
          speaker: 'Buli (BBC)',
          en: 'I often go jogging.',
          vi: 'Tôi thường xuyên đi chạy bộ.'
        },
        {
          start: 35.2,
          end: 39.2,
          speaker: 'Buli (BBC)',
          en: 'I sometimes go swimming after work.',
          vi: 'Thỉnh thoảng tôi đi bơi sau giờ làm việc.'
        },
        {
          start: 41.5,
          end: 50.2,
          speaker: 'Buli & Sian',
          en: 'And I occasionally watch a film. Do you go clothes shopping?',
          vi: 'Và đôi khi tôi xem một bộ phim. Thế bạn có đi mua sắm quần áo không?'
        },
        {
          start: 50.3,
          end: 53.8,
          speaker: 'Buli (BBC)',
          en: 'No, I hardly ever go clothes shopping.',
          vi: 'Không, tôi hầu như chẳng bao giờ đi mua sắm quần áo.'
        },
        {
          start: 54.5,
          end: 59.2,
          speaker: 'Sian (BBC)',
          en: 'How about skateboarding? Do you go skateboarding?',
          vi: 'Thế còn trượt ván thì sao? Bạn có đi trượt ván không?'
        },
        {
          start: 59.3,
          end: 62.6,
          speaker: 'Buli (BBC)',
          en: 'No, I never go skateboarding.',
          vi: 'Không, tôi không bao giờ chơi trượt ván.'
        },
        {
          start: 64.2,
          end: 68.3,
          speaker: 'Buli (BBC)',
          en: 'How about you, Sian? What is your daily routine?',
          vi: 'Thế còn bạn thì sao? Thói quen hằng ngày của bạn như thế nào?'
        },
        {
          start: 69.0,
          end: 73.3,
          speaker: 'Presenter 2',
          en: 'I usually get up at quarter past six.',
          vi: 'Tôi thường thức dậy vào lúc 6 giờ 15 phút.'
        },
        {
          start: 75.0,
          end: 79.3,
          speaker: 'Presenter 2',
          en: 'I often have porridge for breakfast.',
          vi: 'Tôi thường ăn cháo yến mạch cho bữa sáng.'
        },
        {
          start: 80.8,
          end: 84.4,
          speaker: 'Presenter 2',
          en: 'I sometimes listen to a podcast.',
          vi: 'Thỉnh thoảng tôi nghe một chương trình podcast.'
        },
        {
          start: 84.4,
          end: 87.1,
          speaker: 'Presenter 2',
          en: 'Welcome to Real Easy English.',
          vi: 'Chào mừng các bạn đến với chương trình Real Easy English.'
        },
        {
          start: 87.1,
          end: 90.8,
          speaker: 'Presenter 2',
          en: 'I always cook dinner after work.',
          vi: 'Tôi luôn tự nấu bữa tối sau giờ làm việc.'
        },
        {
          start: 92.9,
          end: 97.2,
          speaker: 'Presenter 2',
          en: 'And I occasionally play video games.',
          vi: 'Và đôi khi tôi chơi trò chơi điện tử.'
        },
        {
          start: 98.5,
          end: 101.2,
          speaker: 'Sian (BBC)',
          en: 'Do you go swimming in the sea?',
          vi: 'Bạn có đi bơi ở ngoài biển không?'
        },
        {
          start: 101.5,
          end: 106.8,
          speaker: 'Presenter 2',
          en: 'No, I hardly ever go swimming in the sea.',
          vi: 'Không, tôi hầu như chẳng bao giờ đi bơi ở biển.'
        },
        {
          start: 107.5,
          end: 109.8,
          speaker: 'Sian (BBC)',
          en: 'Do you drink tea?',
          vi: 'Bạn có uống trà không?'
        },
        {
          start: 109.8,
          end: 113.0,
          speaker: 'Presenter 2',
          en: 'No, I never drink tea.',
          vi: 'Không, tôi không bao giờ uống trà.'
        },
        {
          start: 114.2,
          end: 119.3,
          speaker: 'Georgie (BBC)',
          en: "Hi Georgie! Hello! What's your daily routine?",
          vi: 'Chào Georgie! Xin chào! Thói quen sinh hoạt hằng ngày của bạn là gì?'
        },
        {
          start: 119.4,
          end: 123.5,
          speaker: 'Georgie (BBC)',
          en: 'I usually get up at quarter to eight.',
          vi: 'Tôi thường thức dậy vào lúc 8 giờ kém 15.'
        },
        {
          start: 124.5,
          end: 128.6,
          speaker: 'Georgie (BBC)',
          en: 'I often eat cereal for breakfast.',
          vi: 'Tôi thường ăn ngũ cốc vào bữa sáng.'
        },
        {
          start: 130.9,
          end: 135.3,
          speaker: 'Georgie (BBC)',
          en: 'I always read the news on the train.',
          vi: 'Tôi luôn luôn đọc tin tức khi đi trên tàu.'
        },
        {
          start: 136.0,
          end: 141.0,
          speaker: 'Georgie (BBC)',
          en: 'I sometimes exercise after work.',
          vi: 'Thỉnh thoảng tôi tập thể dục sau giờ làm việc.'
        },
        {
          start: 142.6,
          end: 145.8,
          speaker: 'Georgie (BBC)',
          en: 'And I occasionally watch TV.',
          vi: 'Và đôi khi tôi xem truyền hình.'
        },
        {
          start: 147.4,
          end: 154.8,
          speaker: 'Georgie (BBC)',
          en: 'Do you sometimes go to the gym? No, I hardly ever go to the gym.',
          vi: 'Bạn có thỉnh thoảng đến phòng tập gym không? Không, tôi hiếm khi đến phòng gym lắm.'
        }
      ]
    },
    {
      id: 'b1-elllo-50-jill',
      title: 'ELLLO #50: Jill from Australia — What Are You Wearing Today?',
      source: 'ELLLO B1 Audio & Video #50 (Giọng người thật)',
      topic: 'VSTEP Part 1–2 • Daily Life & Experiences',
      duration: '01:05',
      youtubeId: '',
      audioUrl: './audio/elllo-50-jill.mp3',
      vstepQuestions: [
        {
          id: 'q1',
          question: '1. Where did Jill get the T-shirt she is wearing today?',
          questionVi: 'Jill đã mua chiếc áo phông cô ấy đang mặc hôm nay ở đâu?',
          options: [
            'A. She bought it at a shopping mall in Sydney',
            'B. She got it during her most recent holiday',
            'C. Her best friend gave it to her as a birthday gift',
            'D. She ordered it from an online clothing store'
          ],
          answer: 1,
          evidenceIdx: 3,
          explain: 'Ở câu #4, Jill nói rõ: "...because I am wearing my new favorite T-shirt, and it is from my most recent holiday." Đáp án đúng là B.'
        },
        {
          id: 'q2',
          question: '2. Why does Jill particularly love the green shade of her T-shirt?',
          questionVi: 'Tại sao Jill lại đặc biệt yêu thích tông màu xanh của chiếc áo phông này?',
          options: [
            'A. Because it reminds her of the ocean and forest nature',
            'B. Because dark green makes her look taller in photos',
            'C. Because it was the cheapest shirt at the camp',
            'D. Because it matches her winter jacket'
          ],
          answer: 0,
          evidenceIdx: 4,
          explain: 'Ở câu #5 và #6, Jill chia sẻ: "It is the shade of green that I love the most because it reminds me of the ocean / forest." Đáp án đúng là A.'
        },
        {
          id: 'q3',
          question: '3. What is printed on Jill\'s favorite T-shirt?',
          questionVi: 'Hình ảnh và dòng chữ nào được in trên chiếc áo phông yêu thích của Jill?',
          options: [
            'A. A kangaroo jumping over a forest tree',
            'B. A map of Australia with the words "Surf Every Day"',
            'C. A girl riding a wave and the quote "Either fight it or ride it"',
            'D. A group of campers sitting around a beach fire'
          ],
          answer: 2,
          evidenceIdx: 7,
          explain: 'Ở câu #7 và #8, Jill mô tả: On the T-shirt, it says, "Either fight it or ride it." There is a picture of a girl riding a wave. Đáp án đúng là C.'
        },
        {
          id: 'q4',
          question: '4. What activity did Jill learn during her recent holiday?',
          questionVi: 'Jill đã học hoạt động gì trong kỳ nghỉ gần đây của cô ấy?',
          options: [
            'A. She went to a surfing camp and learned how to surf',
            'B. She joined a mountain hiking club in the forest',
            'C. She taught swimming to children at a summer camp',
            'D. She learned how to design holiday T-shirts'
          ],
          answer: 0,
          evidenceIdx: 8,
          explain: 'Ở câu #9 và #10, Jill giải thích: "...on my recent holiday, I went to a surfing camp. And I learned how to surf." Đáp án đúng là A.'
        }
      ],
      transcript: [
        {
          start: 0,
          end: 2.0,
          speaker: 'Jill (Australia)',
          en: 'Hi everyone.',
          vi: 'Xin chào mọi người.'
        },
        {
          start: 2.0,
          end: 5.5,
          speaker: 'Jill (Australia)',
          en: "My name is Jill and I'm from Australia.",
          vi: 'Tên tôi là Jill và tôi đến từ nước Úc.'
        },
        {
          start: 5.5,
          end: 10.0,
          speaker: 'Jill (Australia)',
          en: 'And my question today is, what are you wearing today?',
          vi: 'Và câu hỏi của tôi ngày hôm nay là: Hôm nay bạn đang mặc trang phục gì?'
        },
        {
          start: 10.0,
          end: 18.5,
          speaker: 'Jill (Australia)',
          en: "I'm actually really excited to answer this question because I am wearing my new favorite T-shirt, and it is from my most recent holiday.",
          vi: 'Thực sự tôi rất hào hứng trả lời câu hỏi này vì tôi đang mặc chiếc áo phông mới yêu thích nhất của mình, được mua từ kỳ nghỉ gần đây nhất.'
        },
        {
          start: 18.5,
          end: 24.5,
          speaker: 'Jill (Australia)',
          en: 'It is the shade of green that I love the most because it reminds me of the ocean.',
          vi: 'Đó là tông màu xanh mà tôi yêu thích nhất bởi vì nó gợi cho tôi nhớ đến đại dương.'
        },
        {
          start: 24.5,
          end: 28.5,
          speaker: 'Jill (Australia)',
          en: 'It also reminds me of the forest.',
          vi: 'Màu xanh ấy cũng gợi cho tôi nhớ đến những cánh rừng.'
        },
        {
          start: 28.5,
          end: 34.0,
          speaker: 'Jill (Australia)',
          en: 'On the T-shirt, it says, "Either fight it or ride it."',
          vi: 'Trên chiếc áo phông có in dòng chữ: "Một là chống lại nó, hai là cưỡi lên nó."'
        },
        {
          start: 34.0,
          end: 39.0,
          speaker: 'Jill (Australia)',
          en: 'There is a picture of a girl riding a wave.',
          vi: 'Trên áo có hình ảnh một cô gái đang cưỡi trên ngọn sóng.'
        },
        {
          start: 39.0,
          end: 47.0,
          speaker: 'Jill (Australia)',
          en: 'And this is the perfect T-shirt for me because on my recent holiday, I went to a surfing camp.',
          vi: 'Và đây là chiếc áo hoàn hảo nhất với tôi bởi vì trong kỳ nghỉ gần đây, tôi đã tham gia một trại học lướt sóng.'
        },
        {
          start: 47.0,
          end: 51.0,
          speaker: 'Jill (Australia)',
          en: 'And I learned how to surf.',
          vi: 'Và tại đó tôi đã học được cách lướt sóng.'
        },
        {
          start: 51.0,
          end: 56.0,
          speaker: 'Jill (Australia)',
          en: 'It was really fun and a great challenge.',
          vi: 'Trải nghiệm đó thực sự rất vui và cũng là một thử thách tuyệt vời.'
        },
        {
          start: 56.0,
          end: 62.5,
          speaker: 'Jill (Australia)',
          en: 'So every time I wear this T-shirt, I remember that wonderful trip.',
          vi: 'Vì thế mỗi lần mặc chiếc áo phông này, tôi lại nhớ về chuyến đi tuyệt vời ấy.'
        }
      ]
    },
    {
      id: 'b1-elllo-04-lesya',
      title: 'ELLLO #04: Lisa (Lesya) from Ukraine — What Time Is It Now?',
      source: 'ELLLO Audio #04 (One Minute English - Giọng người thật)',
      topic: 'VSTEP Part 1 • Time Zones & Living Abroad',
      duration: '00:40',
      youtubeId: '',
      audioUrl: './audio/elllo-04-lesya.mp3',
      vstepQuestions: [
        {
          id: 'q1',
          question: '1. Where is the speaker originally from, and where is she right now?',
          questionVi: 'Người nói quê gốc ở đâu và hiện tại cô ấy đang ở đâu?',
          options: [
            'A. She is from Poland and is currently in Germany',
            'B. She is from Ukraine and is currently in Ukraine',
            'C. She is from Australia and is visiting Poland',
            'D. She is from England and is traveling in Ukraine'
          ],
          answer: 1,
          evidenceIdx: 1,
          explain: 'Ở câu #2 và #4, cô ấy nói: "I am from Ukraine" và "Now I am in Ukraine and it is 11:30 AM." Đáp án đúng là B.'
        },
        {
          id: 'q2',
          question: '2. Where does the speaker usually live?',
          questionVi: 'Người nói thường sinh sống ở quốc gia nào?',
          options: [
            'A. She usually lives in Poland',
            'B. She usually lives in France',
            'C. She usually lives in Canada',
            'D. She usually lives in Australia'
          ],
          answer: 0,
          evidenceIdx: 3,
          explain: 'Ở câu #4, cô ấy chia sẻ: "...but I usually live in Poland, and in Poland now it is 10:30 AM." Đáp án đúng là A.'
        },
        {
          id: 'q3',
          question: '3. What is the time difference between Ukraine and Poland mentioned in the talk?',
          questionVi: 'Độ lệch múi giờ giữa Ukraine và Ba Lan được nhắc tới trong bài là bao nhiêu?',
          options: [
            'A. They are in the exact same time zone',
            'B. Ukraine is one hour ahead of Poland (11:30 AM vs. 10:30 AM)',
            'C. Poland is three hours ahead of Ukraine',
            'D. Ukraine is five hours behind Poland'
          ],
          answer: 1,
          evidenceIdx: 3,
          explain: 'Ở câu #4: tại Ukraine đang là 11:30 AM trong khi ở Ba Lan đang là 10:30 AM (Ukraine sớm hơn Ba Lan 1 tiếng). Đáp án đúng là B.'
        }
      ],
      transcript: [
        {
          start: 0,
          end: 2.5,
          speaker: 'Lisa / Lesya',
          en: 'Hi, I am Lisa.',
          vi: 'Xin chào, tôi là Lisa (Lesya).'
        },
        {
          start: 2.5,
          end: 5.5,
          speaker: 'Lisa / Lesya',
          en: 'I am from Ukraine.',
          vi: 'Tôi đến từ đất nước Ukraine.'
        },
        {
          start: 5.5,
          end: 9.5,
          speaker: 'Lisa / Lesya',
          en: 'My question is, what time is it now?',
          vi: 'Câu hỏi của tôi là: Bây giờ đang là mấy giờ?'
        },
        {
          start: 9.5,
          end: 18.0,
          speaker: 'Lisa / Lesya',
          en: 'Now I am in Ukraine and it is 11:30 AM, but I usually live in Poland and in Poland now it is 10:30 AM.',
          vi: 'Hiện tại tôi đang ở Ukraine và bây giờ là 11 giờ 30 sáng, nhưng tôi thường sống ở Ba Lan và ở Ba Lan lúc này đang là 10 giờ 30 sáng.'
        }
      ]
    },
    {
      id: 'b1-med-1',
      title: 'Clinical Consultation — Persistent Cough & Fever',
      source: 'VSTEP B1 Medical Audio',
      topic: 'VSTEP Part 2 • Doctor–Patient Dialogue',
      duration: '01:15',
      youtubeId: '',
      vstepQuestions: [
        {
          id: 'q1',
          question: '1. How long has the patient been experiencing the persistent cough and fever?',
          questionVi: 'Bệnh nhân đã bị ho dai dẳng và sốt nhẹ trong bao lâu?',
          options: [
            'A. Since yesterday evening',
            'B. For the past four days',
            'C. For more than two weeks',
            'D. Since climbing the stairs this morning'
          ],
          answer: 1,
          evidenceIdx: 1,
          explain: 'Ở câu #2, bệnh nhân nói: "I have had a persistent cough and a low-grade fever for the past four days." ("for the past four days" = trong 4 ngày qua). Đáp án đúng là B.'
        },
        {
          id: 'q2',
          question: '2. How did the patient\'s symptoms begin before getting worse?',
          questionVi: 'Triệu chứng của bệnh nhân bắt đầu như thế nào trước khi trở nặng?',
          options: [
            'A. With a sudden high fever at midnight',
            'B. With severe pain in the lower back',
            'C. With a mild sore throat that gradually worsened',
            'D. With dizziness after taking cough medicine'
          ],
          answer: 2,
          evidenceIdx: 2,
          explain: 'Ở câu #3, bệnh nhân cho biết: "They started with a mild sore throat, and then the cough gradually got worse at night." Đáp án đúng là C.'
        },
        {
          id: 'q3',
          question: '3. What happens when the patient climbs the stairs?',
          questionVi: 'Điều gì xảy ra khi bệnh nhân bước lên cầu thang?',
          options: [
            'A. The patient\'s chest feels tight',
            'B. The fever immediately disappears',
            'C. The sore throat becomes much better',
            'D. The patient feels hungry and thirsty'
          ],
          answer: 0,
          evidenceIdx: 3,
          explain: 'Ở câu #4, bệnh nhân trả lời bác sĩ: "Yes, my chest feels tight when I climb the stairs." (Ngực tôi cảm thấy tức khi leo cầu thang). Đáp án đúng là A.'
        },
        {
          id: 'q4',
          question: '4. What will the doctor do next during the examination?',
          questionVi: 'Bác sĩ sẽ làm gì tiếp theo trong buổi khám?',
          options: [
            'A. Send the patient home without any tests',
            'B. Listen to the patient\'s lungs and check oxygen saturation',
            'C. Schedule a surgical operation for tomorrow',
            'D. Ask the patient to run around the hospital park'
          ],
          answer: 1,
          evidenceIdx: 4,
          explain: 'Ở câu #5, bác sĩ nói: "Let me listen to your lungs and check your oxygen saturation right now." Đáp án đúng là B.'
        }
      ],
      transcript: [
        {
          start: 0,
          end: 4,
          speaker: 'Doctor',
          en: 'Good morning. What brings you to the clinic today?',
          vi: 'Chào buổi sáng. Hôm nay triệu chứng gì đưa bạn đến phòng khám vậy?'
        },
        {
          start: 4,
          end: 10,
          speaker: 'Patient',
          en: 'I have had a persistent cough and a low-grade fever for the past four days.',
          vi: 'Tôi bị ho dai dẳng và sốt nhẹ trong suốt bốn ngày vừa qua.'
        },
        {
          start: 10,
          end: 16,
          speaker: 'Doctor',
          en: 'When did you first notice these symptoms, and do you have any shortness of breath?',
          vi: 'Bạn bắt đầu nhận thấy các triệu chứng này từ khi nào, và bạn có bị khó thở không?'
        },
        {
          start: 16,
          end: 22,
          speaker: 'Patient',
          en: 'They started with a mild sore throat, and then the cough gradually got worse at night.',
          vi: 'Chúng bắt đầu bằng triệu chứng đau họng nhẹ, rồi sau đó cơn ho nặng dần lên vào ban đêm.'
        },
        {
          start: 22,
          end: 27,
          speaker: 'Patient',
          en: 'Yes, my chest feels tight when I climb the stairs.',
          vi: 'Có, lồng ngực tôi cảm thấy tức nghẹn mỗi khi bước lên cầu thang.'
        },
        {
          start: 27,
          end: 33,
          speaker: 'Doctor',
          en: 'Please take a deep breath. Let me listen to your lungs and check your oxygen saturation.',
          vi: 'Bạn hãy hít một hơi thật sâu nhé. Để tôi nghe phổi và kiểm tra độ bão hòa ô-xy của bạn.'
        }
      ]
    },
    {
      id: 'b1-elllo-1430',
      title: 'ELLLO #1430 — Staying Healthy & Sleep Habits',
      source: 'ELLLO Audio B1',
      topic: 'VSTEP Part 1–2 • Lifestyle & Wellness',
      duration: '01:20',
      youtubeId: '',
      vstepQuestions: [
        {
          id: 'q1',
          question: '1. Why did Speaker B feel exhausted in the afternoon in the past?',
          questionVi: 'Tại sao trước đây Người nói B luôn cảm thấy kiệt sức vào buổi chiều?',
          options: [
            'A. Because of working night shifts at a hospital',
            'B. Because of skipping breakfast and drinking too much coffee',
            'C. Because of running ten kilometers every morning',
            'D. Because of sleeping ten hours every day'
          ],
          answer: 1,
          evidenceIdx: 1,
          explain: 'Ở câu #2, Người nói B thừa nhận: "Honestly, I used to skip breakfast and drink too much coffee, so I always felt exhausted." Đáp án đúng là B.'
        },
        {
          id: 'q2',
          question: '2. According to Speaker B, what two factors are essential for concentration?',
          questionVi: 'Theo Người nói B, hai yếu tố nào là thiết yếu cho sự tập trung?',
          options: [
            'A. Expensive vitamins and energy drinks',
            'B. Seven hours of sleep and a balanced diet',
            'C. Late-night study sessions and strong tea',
            'D. Watching television and playing video games'
          ],
          answer: 1,
          evidenceIdx: 2,
          explain: 'Ở câu #3, Người nói B nói rõ: "I realized that seven hours of sleep and a balanced diet are essential for my concentration." Đáp án đúng là B.'
        },
        {
          id: 'q3',
          question: '3. What changes has Speaker B made to the morning routine now?',
          questionVi: 'Người nói B hiện nay đã thay đổi thói quen buổi sáng như thế nào?',
          options: [
            'A. Preparing oatmeal with fruit and walking to campus instead of taking the bus',
            'B. Eating fast food on the bus every morning',
            'C. Skipping both breakfast and lunch to save time',
            'D. Driving a car to campus at six o\'clock'
          ],
          answer: 0,
          evidenceIdx: 3,
          explain: 'Ở câu #4, Người nói B chia sẻ: "Now I prepare oatmeal with fruit every morning and walk to campus instead of taking the bus." Đáp án đúng là A.'
        }
      ],
      transcript: [
        {
          start: 0,
          end: 5,
          speaker: 'Speaker A',
          en: 'How do you usually keep in shape when you have such a busy schedule?',
          vi: 'Bạn thường giữ gìn sức khỏe như thế nào khi có một lịch trình bận rộn như vậy?'
        },
        {
          start: 5,
          end: 11,
          speaker: 'Speaker B',
          en: 'Honestly, I used to skip breakfast and drink too much coffee, so I always felt exhausted.',
          vi: 'Thành thật mà nói, trước đây tôi hay bỏ bữa sáng và uống quá nhiều cà phê nên lúc nào cũng thấy kiệt sức.'
        },
        {
          start: 11,
          end: 17,
          speaker: 'Speaker B',
          en: 'Last month, I changed my routine because I realized that seven hours of sleep and a balanced diet are essential for my concentration.',
          vi: 'Tháng trước, tôi đã thay đổi thói quen vì nhận ra rằng ngủ đủ bảy tiếng và chế độ ăn cân bằng là điều thiết yếu cho sự tập trung.'
        },
        {
          start: 17,
          end: 23,
          speaker: 'Speaker B',
          en: 'Now I prepare oatmeal with fruit every morning and walk to campus instead of taking the bus.',
          vi: 'Hiện giờ sáng nào tôi cũng chuẩn bị yến mạch trộn trái cây và đi bộ đến trường thay vì đi xe buýt.'
        },
        {
          start: 23,
          end: 29,
          speaker: 'Speaker A',
          en: 'That sounds like a great habit! Even simple changes can improve our mental clarity.',
          vi: 'Nghe quả là một thói quen tuyệt vời! Ngay cả những thay đổi đơn giản cũng có thể cải thiện sự minh mẫn tinh thần của chúng ta.'
        }
      ]
    }
  ];

  const LESSONS_B2 = [
    {
      id: 'b2-med-1',
      title: 'Emergency Triage — Acute Appendicitis & Peritonitis',
      source: 'VSTEP B2 Medical Lecture',
      topic: 'VSTEP Part 3 • Clinical Case Briefing',
      duration: '01:35',
      youtubeId: '',
      vstepQuestions: [
        {
          id: 'q1',
          question: '1. Where has the patient\'s abdominal pain migrated to?',
          questionVi: 'Cơn đau bụng của bệnh nhân đã khu trú (di chuyển) đến vị trí nào?',
          options: [
            'A. The left upper chest area',
            'B. The right lower quadrant',
            'C. The lower back and shoulders',
            'D. The upper stomach near the ribs'
          ],
          answer: 1,
          evidenceIdx: 0,
          explain: 'Ở câu #1, bác sĩ trình bày ca bệnh: "...severe abdominal pain that has migrated to the right lower quadrant" (vùng hố chậu phải - dấu hiệu điển hình của viêm ruột thừa cấp). Đáp án đúng là B.'
        },
        {
          id: 'q2',
          question: '2. Which clinical signs were found during the physical examination?',
          questionVi: 'Những dấu hiệu lâm sàng nào được phát hiện khi khám thực thể?',
          options: [
            'A. High blood pressure and slow heart rate',
            'B. Marked rebound tenderness and abdominal guarding',
            'C. Skin rash and joint swelling',
            'D. Blurred vision and severe headache'
          ],
          answer: 1,
          evidenceIdx: 2,
          explain: 'Ở câu #3: "Physical examination reveals marked rebound tenderness and guarding" (phản ứng dội và co cứng thành bụng). Đáp án đúng là B.'
        },
        {
          id: 'q3',
          question: '3. Why are an urgent ultrasound and surgical consultation warranted immediately?',
          questionVi: 'Tại sao cần chỉ định siêu âm khẩn cấp và hội chẩn ngoại khoa ngay lập tức?',
          options: [
            'A. To discharge the patient before the weekend',
            'B. To prevent perforation of the appendix',
            'C. To test a new vitamin supplement',
            'D. To reduce the cost of hospital stay'
          ],
          answer: 1,
          evidenceIdx: 4,
          explain: 'Ở câu #5: "An urgent abdominal ultrasound and surgical consultation are warranted immediately to prevent perforation" ("prevent perforation" = ngăn ngừa biến chứng vỡ/thủng ruột thừa). Đáp án đúng là B.'
        }
      ],
      transcript: [
        {
          start: 0,
          end: 7,
          speaker: 'Attending Physician',
          en: 'The patient is presenting with severe abdominal pain that has migrated to the right lower quadrant.',
          vi: 'Bệnh nhân nhập viện với cơn đau bụng dữ dội đã khu trú xuống vùng hố chậu phải.'
        },
        {
          start: 7,
          end: 14,
          speaker: 'Attending Physician',
          en: 'Onset occurred approximately twelve hours ago, accompanied by nausea and anorexia.',
          vi: 'Khởi phát cách đây khoảng mười hai giờ, kèm theo buồn nôn và chán ăn.'
        },
        {
          start: 14,
          end: 21,
          speaker: 'Attending Physician',
          en: 'Physical examination reveals marked rebound tenderness and guarding.',
          vi: 'Khám thực thể phát hiện dấu hiệu cảm ứng phúc mạc (phản ứng dội) rõ rệt và co cứng thành bụng.'
        },
        {
          start: 21,
          end: 28,
          speaker: 'Attending Physician',
          en: 'Laboratory findings indicate leukocytosis with an elevated neutrophil count.',
          vi: 'Kết quả xét nghiệm cho thấy tình trạng tăng bạch cầu kèm chỉ số bạch cầu đa nhân trung tính tăng cao.'
        },
        {
          start: 28,
          end: 36,
          speaker: 'Attending Physician',
          en: 'An urgent abdominal ultrasound and surgical consultation are warranted immediately to prevent perforation.',
          vi: 'Cần chỉ định siêu âm bụng khẩn cấp và hội chẩn ngoại khoa ngay lập tức để ngăn ngừa biến chứng thủng tạng.'
        }
      ]
    },
    {
      id: 'b2-elllo-telemed',
      title: 'VSTEP B2 Lecture — Telemedicine & Antibiotic Resistance',
      source: 'ELLLO B2 Academic Health Talk',
      topic: 'VSTEP Part 3 • Public Health & Technology',
      duration: '01:40',
      youtubeId: '',
      vstepQuestions: [
        {
          id: 'q1',
          question: '1. What is the main benefit of telemedicine mentioned by the speaker?',
          questionVi: 'Lợi ích chính của y học từ xa (telemedicine) được diễn giả nhắc đến là gì?',
          options: [
            'A. It completely replaces all surgical hospitals',
            'B. It improves access to primary healthcare in remote regions',
            'C. It allows patients to buy antibiotics without a doctor',
            'D. It eliminates the need for medical universities'
          ],
          answer: 1,
          evidenceIdx: 0,
          explain: 'Ở câu #1, diễn giả nêu rõ: "Telemedicine has transformed how patients access primary healthcare, especially in remote regions." Đáp án đúng là B.'
        },
        {
          id: 'q2',
          question: '2. According to the lecture, why is prescribing antibiotics during virtual consultations risky?',
          questionVi: 'Theo bài giảng, tại sao việc kê đơn kháng sinh qua khám trực tuyến lại tiềm ẩn rủi ro?',
          options: [
            'A. Because internet connections are too expensive',
            'B. Because it is often done without proper diagnostic testing, increasing antimicrobial resistance',
            'C. Because patients prefer taking herbal tea instead',
            'D. Because pharmacies in cities do not accept online prescriptions'
          ],
          answer: 1,
          evidenceIdx: 1,
          explain: 'Ở câu #2 và #3: "...prescribing antibiotics without proper diagnostic testing poses significant risks. Antimicrobial resistance occurs when bacteria adapt to misused medications." Đáp án đúng là B.'
        },
        {
          id: 'q3',
          question: '3. What must clinicians do during virtual consultations to protect public health?',
          questionVi: 'Các bác sĩ lâm sàng phải làm gì khi khám tư vấn trực tuyến để bảo vệ sức khỏe cộng đồng?',
          options: [
            'A. Prescribe antibiotics to every patient with a mild cough',
            'B. Adhere to strict evidence-based guidelines',
            'C. Limit consultations to less than two minutes',
            'D. Avoid speaking to patients in rural areas'
          ],
          answer: 1,
          evidenceIdx: 3,
          explain: 'Ở câu #4: "Therefore, clinicians must adhere to strict evidence-based guidelines even during virtual consultations." Đáp án đúng là B.'
        }
      ],
      transcript: [
        {
          start: 0,
          end: 7,
          speaker: 'Lecturer',
          en: 'Telemedicine has transformed how patients access primary healthcare, especially in remote regions.',
          vi: 'Y học từ xa đã thay đổi mạnh mẽ cách bệnh nhân tiếp cận dịch vụ chăm sóc sức khỏe ban đầu, đặc biệt là ở các vùng sâu vùng xa.'
        },
        {
          start: 7,
          end: 15,
          speaker: 'Lecturer',
          en: 'However, prescribing antibiotics without proper diagnostic testing poses significant risks.',
          vi: 'Tuy nhiên, việc kê đơn thuốc kháng sinh mà không có xét nghiệm chẩn đoán xác đáng lại tiềm ẩn những rủi ro nghiêm trọng.'
        },
        {
          start: 15,
          end: 23,
          speaker: 'Lecturer',
          en: 'Antimicrobial resistance occurs when bacteria adapt to misused medications.',
          vi: 'Tình trạng kháng kháng sinh xảy ra khi vi khuẩn thích nghi với các loại thuốc bị lạm dụng hoặc dùng sai chỉ định.'
        },
        {
          start: 23,
          end: 31,
          speaker: 'Lecturer',
          en: 'Therefore, clinicians must adhere to strict evidence-based guidelines even during virtual consultations.',
          vi: 'Do đó, các bác sĩ lâm sàng bắt buộc phải tuân thủ nghiêm ngặt phác đồ dựa trên y học thực chứng ngay cả khi khám tư vấn trực tuyến.'
        }
      ]
    }
  ];

  global.LEXI_LISTENING_DATA = {
    WORD_DICT: WORD_DICT,
    B1: LESSONS_B1,
    B2: LESSONS_B2
  };
})(window);
