/**
 * LexiContext Academy — Studio Luyện Nghe & Luyện Nói 3-Trong-1 (academy-listening.js)
 * Tích hợp:
 * - Bố cục Studio 2 Cột hiện đại (Trình phát Video YouTube / Audio ELLLO + Danh sách câu bên trái | Khung thực hành câu bên phải)
 * - 3 Chế độ liên thông: 🗣️ Shadowing (Luyện nói) · ⌨️ Dictation (Chép chính tả) · 🎧 Nghe hiểu VSTEP
 * - Phiên âm IPA ngay dưới từng từ + Chạm từ bất kỳ để tra nghĩa & lưu vào Kho từ vựng 1-chạm
 * - Ghi âm giọng nói thật (MediaRecorder + SpeechRecognition), nghe lại băng ghi âm của chính mình,
 *   chấm từng từ bằng Thẻ Màu (Xanh ✓ / Vàng ▲ / Đỏ ✗) và Huấn luyện viên AI nhận xét phát âm 4 mục chi tiết
 * - Điều chỉnh tốc độ phát (0.5x · 0.75x · 1.0x · 1.25x · 1.5x), Ghép câu kế tiếp (1/2) & Nút Tách cụm 2 chế độ
 */
(function (global) {
  'use strict';

  const LS_STUDIO_CUSTOM_KEY = 'lexicontext_studio_custom_lessons_v1';

  // Từ điển IPA & Nghĩa Tiếng Việt tích hợp sẵn cho các từ vựng thông dụng, VSTEP B1-B2 & Y khoa
  const BUILTIN_WORD_DICT = {
    easy: { ipa: 'ˈiː.zi', pos: 'adj', vi: 'dễ dàng, thoải mái', ex: 'The first part of the exam was easy.' },
    english: { ipa: 'ˈɪŋ.ɡlɪʃ', pos: 'noun', vi: 'tiếng Anh, người Anh', ex: 'She speaks fluent English.' },
    conversations: { ipa: 'ˌkɑːn.vɚˈseɪ.ʃənz', pos: 'noun', vi: 'các cuộc hội thoại, trò chuyện', ex: 'Easy English conversations help you practice daily.' },
    conversation: { ipa: 'ˌkɑːn.vɚˈseɪ.ʃən', pos: 'noun', vi: 'cuộc hội thoại', ex: 'We had a long conversation.' },
    how: { ipa: 'haʊ', pos: 'adv', vi: 'như thế nào, bao nhiêu', ex: 'How often do you exercise?' },
    often: { ipa: 'ˈɔː.fən', pos: 'adv', vi: 'thường xuyên', ex: 'How often do you go swimming?' },
    do: { ipa: 'duː', pos: 'verb', vi: 'làm (trợ động từ)', ex: 'What do you do every day?' },
    you: { ipa: 'juː', pos: 'pron', vi: 'bạn, các bạn', ex: 'How are you feeling today?' },
    go: { ipa: 'ɡoʊ', pos: 'verb', vi: 'đi', ex: 'I go to the hospital every morning.' },
    swimming: { ipa: 'ˈswɪm.ɪŋ', pos: 'noun', vi: 'bơi lội', ex: 'Swimming is great for cardiovascular health.' },
    hello: { ipa: 'həˈloʊ', pos: 'interj', vi: 'xin chào', ex: 'Hello, nice to meet you.' },
    buli: { ipa: 'ˈbuː.li', pos: 'noun', vi: 'Buli (tên người dẫn BBC)', ex: 'Hello, Buli!' },
    hi: { ipa: 'haɪ', pos: 'interj', vi: 'chào (thân mật)', ex: 'Hi Sian! How are you?' },
    sian: { ipa: 'ʃɑːn', pos: 'noun', vi: 'Sian (tên người dẫn BBC, đọc là /ʃɑːn/)', ex: 'Hi Sian! What is your daily routine?' },
    what: { ipa: 'wʌt', pos: 'pron', vi: 'cái gì, điều gì', ex: 'What is your daily routine?' },
    is: { ipa: 'ɪz', pos: 'verb', vi: 'thì, là', ex: 'What is the main symptom?' },
    your: { ipa: 'jʊr', pos: 'det', vi: 'của bạn', ex: 'Please describe your daily routine.' },
    daily: { ipa: 'ˈdeɪ.li', pos: 'adj', vi: 'hàng ngày', ex: 'Exercise should be part of your daily routine.' },
    routine: { ipa: 'ruːˈtiːn', pos: 'noun', vi: 'lịch trình, thói quen hàng ngày', ex: 'My daily routine starts at 6 a.m.' },
    well: { ipa: 'wel', pos: 'interj/adv', vi: 'à, ừm / tốt, khỏe', ex: 'Well, I always get up at seven o’clock.' },
    i: { ipa: 'aɪ', pos: 'pron', vi: 'tôi, mình', ex: 'I work at a medical center.' },
    always: { ipa: 'ˈɔːl.weɪz', pos: 'adv', vi: 'luôn luôn', ex: 'I always wash my hands before meals.' },
    get: { ipa: 'ɡet', pos: 'verb', vi: 'thức (get up), nhận được', ex: 'I get up early on weekdays.' },
    up: { ipa: 'ʌp', pos: 'adv', vi: 'lên, dậy (get up)', ex: 'What time do you get up?' },
    at: { ipa: 'æt', pos: 'prep', vi: 'vào lúc, tại', ex: 'The clinic opens at seven o’clock.' },
    seven: { ipa: 'ˈsev.ən', pos: 'num', vi: 'số bảy (7)', ex: 'I get up at seven o’clock.' },
    "o'clock": { ipa: 'əˈklɑːk', pos: 'adv', vi: 'giờ đúng', ex: 'It is seven o’clock in the morning.' },
    usually: { ipa: 'ˈjuː.ʒu.ə.li', pos: 'adv', vi: 'thường lệ, thường thường', ex: 'I usually have fruit and yogurt for breakfast.' },
    have: { ipa: 'hæv', pos: 'verb', vi: 'có, ăn/uống', ex: 'I have breakfast at home.' },
    fruit: { ipa: 'fruːt', pos: 'noun', vi: 'trái cây, hoa quả', ex: 'Fresh fruit provides essential vitamins.' },
    and: { ipa: 'ænd', pos: 'conj', vi: 'và', ex: 'Rest and hydration are important.' },
    yogurt: { ipa: 'ˈjoʊ.ɡɚt', pos: 'noun', vi: 'sữa chua', ex: 'Yogurt is good for digestion.' },
    for: { ipa: 'fɔːr', pos: 'prep', vi: 'cho, trong khoảng', ex: 'Take this medicine for seven days.' },
    breakfast: { ipa: 'ˈbrek.fəst', pos: 'noun', vi: 'bữa ăn sáng', ex: 'Never skip breakfast before clinical rounds.' },
    then: { ipa: 'ðen', pos: 'adv', vi: 'sau đó', ex: 'First we run a blood test, then an ultrasound.' },
    to: { ipa: 'tuː', pos: 'prep', vi: 'đến, để', ex: 'I go to work by bus.' },
    work: { ipa: 'wɜːrk', pos: 'noun/verb', vi: 'công việc, làm việc', ex: 'She goes to work at eight.' },
    by: { ipa: 'baɪ', pos: 'prep', vi: 'bằng (phương tiện), bởi', ex: 'I commute to the hospital by bus.' },
    bus: { ipa: 'bʌs', pos: 'noun', vi: 'xe buýt', ex: 'Taking the bus reduces traffic.' },
    check: { ipa: 'tʃek', pos: 'verb', vi: 'kiểm tra, khám', ex: 'Let me check your blood pressure.' },
    my: { ipa: 'maɪ', pos: 'det', vi: 'của tôi', ex: 'I check my emails in the morning.' },
    emails: { ipa: 'ˈiː.meɪlz', pos: 'noun', vi: 'thư điện tử (email)', ex: 'I reply to urgent emails every morning.' },
    in: { ipa: 'ɪn', pos: 'prep', vi: 'trong, vào buổi', ex: 'I study English in the evening.' },
    the: { ipa: 'ðə', pos: 'det', vi: 'cái, việc (mạo từ xác định)', ex: 'The patient is recovering well.' },
    morning: { ipa: 'ˈmɔːr.nɪŋ', pos: 'noun', vi: 'buổi sáng', ex: 'I have classes in the morning.' },
    during: { ipa: 'ˈdʊr.ɪŋ', pos: 'prep', vi: 'trong suốt (khoảng thời gian)', ex: 'Drink plenty of water during the day.' },
    week: { ipa: 'wiːk', pos: 'noun', vi: 'tuần lễ', ex: 'I exercise three times a week.' },
    twice: { ipa: 'twaɪs', pos: 'adv', vi: 'hai lần', ex: 'Take one tablet twice a day.' },
    a: { ipa: 'ə', pos: 'det', vi: 'một (mỗi)', ex: 'Twice a week.' },
    because: { ipa: 'bɪˈkɑːz', pos: 'conj', vi: 'bởi vì', ex: 'I swim because it keeps me fit.' },
    it: { ipa: 'ɪt', pos: 'pron', vi: 'nó, việc đó', ex: 'It helps me relax after work.' },
    helps: { ipa: 'helps', pos: 'verb', vi: 'giúp đỡ, hỗ trợ', ex: 'Regular exercise helps prevent disease.' },
    me: { ipa: 'miː', pos: 'pron', vi: 'tôi (tân ngữ)', ex: 'It helps me stay healthy.' },
    stay: { ipa: 'steɪ', pos: 'verb', vi: 'duy trì, giữ, ở lại', ex: 'How do you stay healthy?' },
    healthy: { ipa: 'ˈhel.θi', pos: 'adj', vi: 'khỏe mạnh, lành mạnh', ex: 'A balanced diet keeps you healthy.' },
    relax: { ipa: 'rɪˈlæks', pos: 'verb', vi: 'thư giãn, nghỉ ngơi', ex: 'Listening to music helps me relax.' },
    after: { ipa: 'ˈæf.tɚ', pos: 'prep', vi: 'sau, sau khi', ex: 'Take the medicine after meals.' },
    long: { ipa: 'lɔːŋ', pos: 'adj/adv', vi: 'dài, bao lâu (how long)', ex: 'How long have you had this fever?' },
    been: { ipa: 'bɪn', pos: 'verb', vi: 'đã từng (quá khứ phân từ của be)', ex: 'How long have you been waiting?' },
    experiencing: { ipa: 'ɪkˈspɪr.i.ən.sɪŋ', pos: 'verb', vi: 'trải qua, gặp phải (triệu chứng)', ex: 'Are you experiencing any dizziness?' },
    this: { ipa: 'ðɪs', pos: 'det', vi: 'này, điều này', ex: 'How long have you had this pain?' },
    sharp: { ipa: 'ʃɑːrp', pos: 'adj', vi: 'nhói, sắc, dữ dội (đau)', ex: 'He felt a sharp pain in his abdomen.' },
    abdominal: { ipa: 'æbˈdɑː.mɪ.nəl', pos: 'adj', vi: 'thuộc vùng bụng, ổ bụng', ex: 'Abdominal ultrasound confirmed the diagnosis.' },
    pain: { ipa: 'peɪn', pos: 'noun', vi: 'cơn đau, sự đau đớn', ex: 'The pain started around the navel.' },
    started: { ipa: 'ˈstɑːr.tɪd', pos: 'verb', vi: 'bắt đầu, khởi phát', ex: 'The symptoms started yesterday evening.' },
    yesterday: { ipa: 'ˈjes.tɚ.deɪ', pos: 'adv', vi: 'hôm qua', ex: 'He was admitted to the hospital yesterday.' },
    evening: { ipa: 'ˈiːv.nɪŋ', pos: 'noun', vi: 'buổi tối', ex: 'The fever worsened in the evening.' },
    moved: { ipa: 'muːvd', pos: 'verb', vi: 'di chuyển, lan xuống', ex: 'The pain moved to the lower right side.' },
    lower: { ipa: 'ˈloʊ.ɚ', pos: 'adj', vi: 'phía dưới, hạ', ex: 'Pain in the right lower quadrant.' },
    right: { ipa: 'raɪt', pos: 'adj', vi: 'bên phải, đúng', ex: 'Right lower abdominal pain.' },
    side: { ipa: 'saɪd', pos: 'noun', vi: 'bên, phía, vùng', ex: 'Does it hurt on the right side?' },
    understand: { ipa: 'ˌʌn.dɚˈstænd', pos: 'verb', vi: 'hiểu, thông cảm', ex: 'I understand you are in pain.' },
    need: { ipa: 'niːd', pos: 'verb', vi: 'cần phải', ex: 'We need to run a quick blood test.' },
    run: { ipa: 'rʌn', pos: 'verb', vi: 'tiến hành (xét nghiệm), chạy', ex: 'We will run a blood test immediately.' },
    blood: { ipa: 'blʌd', pos: 'noun', vi: 'máu, huyết', ex: 'White blood cell count was elevated.' },
    test: { ipa: 'test', pos: 'noun', vi: 'xét nghiệm, bài kiểm tra', ex: 'The blood test results are ready.' },
    ultrasound: { ipa: 'ˈʌl.trə.saʊnd', pos: 'noun', vi: 'siêu âm', ex: 'An abdominal ultrasound is non-invasive.' },
    immediately: { ipa: 'ɪˈmiː.di.ət.li', pos: 'adv', vi: 'ngay lập tức, tức thì', ex: 'Please notify the surgeon immediately.' },
    please: { ipa: 'pliːz', pos: 'interj', vi: 'vui lòng, xin hãy', ex: 'Please lie down on the examination table.' },
    take: { ipa: 'teɪk', pos: 'verb', vi: 'uống (thuốc), lấy', ex: 'Take one tablet twice a day.' },
    one: { ipa: 'wʌn', pos: 'num', vi: 'một (1)', ex: 'Take one tablet after meals.' },
    tablet: { ipa: 'ˈtæb.lət', pos: 'noun', vi: 'viên thuốc nén', ex: 'Swallow the tablet with a glass of water.' },
    day: { ipa: 'deɪ', pos: 'noun', vi: 'ngày', ex: 'Drink two liters of water a day.' },
    meals: { ipa: 'miːlz', pos: 'noun', vi: 'các bữa ăn', ex: 'Take the medication after meals.' },
    days: { ipa: 'deɪz', pos: 'noun', vi: 'các ngày', ex: 'Complete the full course of seven days.' },
    getting: { ipa: 'ˈɡet.ɪŋ', pos: 'verb', vi: 'việc có được, nhận được', ex: 'Getting enough sleep is vital.' },
    enough: { ipa: 'ɪˈnʌf', pos: 'det/adv', vi: 'đủ, đầy đủ', ex: 'Are you getting enough sleep?' },
    sleep: { ipa: 'sliːp', pos: 'noun/verb', vi: 'giấc ngủ, ngủ', ex: 'Lack of sleep weakens immunity.' },
    regular: { ipa: 'ˈreɡ.jə.lɚ', pos: 'adj', vi: 'đều đặn, thường xuyên', ex: 'Regular physical activity improves mood.' },
    exercise: { ipa: 'ˈek.sɚ.saɪz', pos: 'noun/verb', vi: 'tập thể dục, vận động', ex: 'Regular exercise boosts your immune system.' },
    can: { ipa: 'kæn', pos: 'verb', vi: 'có thể', ex: 'Stress can affect your digestion.' },
    significantly: { ipa: 'sɪɡˈnɪf.ɪ.kənt.li', pos: 'adv', vi: 'một cách đáng kể, rõ rệt', ex: 'His condition improved significantly.' },
    boost: { ipa: 'buːst', pos: 'verb', vi: 'tăng cường, thúc đẩy mạnh', ex: 'Vitamin C helps boost immunity.' },
    immune: { ipa: 'ɪˈmjuːn', pos: 'adj', vi: 'miễn dịch', ex: 'A strong immune system fights infections.' },
    system: { ipa: 'ˈsɪs.təm', pos: 'noun', vi: 'hệ thống, hệ cơ quan', ex: 'The immune system protects the body.' },
    delayed: { ipa: 'dɪˈleɪd', pos: 'adj/verb', vi: 'bị trì hoãn, chậm trễ', ex: 'Delayed diagnosis can cause complications.' },
    diagnosis: { ipa: 'ˌdaɪ.əɡˈnoʊ.sɪs', pos: 'noun', vi: 'sự chẩn đoán bệnh', ex: 'Early diagnosis is critical for recovery.' },
    acute: { ipa: 'əˈkjuːt', pos: 'adj', vi: 'cấp tính', ex: 'The patient has acute appendicitis.' },
    appendicitis: { ipa: 'əˌpen.dɪˈsaɪ.tɪs', pos: 'noun', vi: 'viêm ruột thừa', ex: 'Acute appendicitis requires prompt surgery.' },
    lead: { ipa: 'liːd', pos: 'verb', vi: 'dẫn đến (lead to)', ex: 'Untreated infection can lead to sepsis.' },
    perforation: { ipa: 'ˌpɜːr.fəˈreɪ.ʃən', pos: 'noun', vi: 'sự thủng (tạng rỗng)', ex: 'Appendix perforation is a surgical emergency.' },
    generalized: { ipa: 'ˈdʒen.ər.ə.laɪzd', pos: 'adj', vi: 'toàn thể, lan tỏa khắp ổ bụng', ex: 'Generalized abdominal tenderness was noted.' },
    peritonitis: { ipa: 'ˌper.ɪ.təˈnaɪ.tɪs', pos: 'noun', vi: 'viêm phúc mạc', ex: 'Peritonitis requires urgent antibiotic therapy.' },
    physical: { ipa: 'ˈfɪz.ɪ.kəl', pos: 'adj', vi: 'thể chất, thực thể (khám)', ex: 'Physical examination revealed rebound tenderness.' },
    examination: { ipa: 'ɪɡˌzæm.ɪˈneɪ.ʃən', pos: 'noun', vi: 'sự thăm khám, kiểm tra', ex: 'A thorough physical examination is essential.' },
    examinations: { ipa: 'ɪɡˌzæm.ɪˈneɪ.ʃənz', pos: 'noun', vi: 'các cuộc thăm khám trực tiếp', ex: 'Telemedicine cannot replace physical examinations.' },
    revealed: { ipa: 'rɪˈviːld', pos: 'verb', vi: 'cho thấy, phát hiện ra', ex: 'The scan revealed localized inflammation.' },
    localized: { ipa: 'ˈloʊ.kə.laɪzd', pos: 'adj', vi: 'khu trú tại một vùng', ex: 'Localized pain in the right lower quadrant.' },
    resistance: { ipa: 'rɪˈzɪs.təns', pos: 'noun', vi: 'sự đề kháng (thành bụng / kháng thuốc)', ex: 'Abdominal wall resistance was detected.' },
    positive: { ipa: 'ˈpɑː.zə.tɪv', pos: 'adj', vi: 'dương tính, tích cực', ex: 'The patient had positive rebound tenderness.' },
    rebound: { ipa: 'ˈriː.baʊnd', pos: 'noun', vi: 'phản ứng dội (Blumberg)', ex: 'Rebound tenderness indicates peritoneal irritation.' },
    tenderness: { ipa: 'ˈten.dɚ.nəs', pos: 'noun', vi: 'đau khi ấn khám', ex: 'Severe tenderness in the lower abdomen.' },
    requires: { ipa: 'rɪˈkwaɪɚz', pos: 'verb', vi: 'đòi hỏi, yêu cầu bắt buộc', ex: 'This condition requires immediate surgery.' },
    immediate: { ipa: 'ɪˈmiː.di.ət', pos: 'adj', vi: 'ngay lập tức, cấp cứu', ex: 'Immediate surgical consultation is needed.' },
    surgical: { ipa: 'ˈsɜːr.dʒɪ.kəl', pos: 'adj', vi: 'thuộc phẫu thuật, ngoại khoa', ex: 'Surgical intervention was successful.' },
    consultation: { ipa: 'ˌkɑːn.sʌlˈteɪ.ʃən', pos: 'noun', vi: ' sự hội chẩn, tư vấn bác sĩ', ex: 'We requested an urgent surgical consultation.' },
    although: { ipa: 'ɔːlˈðoʊ', pos: 'conj', vi: 'mặc dù', ex: 'Although telemedicine is convenient, it has limits.' },
    telemedicine: { ipa: 'ˌtel.ɪˈmed.ɪ.sɪn', pos: 'noun', vi: 'y tế từ xa, khám bệnh trực tuyến', ex: 'Telemedicine expanded rapidly in recent years.' },
    offers: { ipa: 'ˈɔː.fɚz', pos: 'verb', vi: 'mang lại, cung cấp', ex: 'Remote monitoring offers great flexibility.' },
    unprecedented: { ipa: 'ʌnˈpres.ɪ.den.tɪd', pos: 'adj', vi: 'chưa từng có tiền lệ', ex: 'Technology offers unprecedented convenience.' },
    convenience: { ipa: 'kənˈviː.ni.əns', pos: 'noun', vi: 'sự tiện lợi, thuận tiện', ex: 'Patients appreciate the convenience of online booking.' },
    cannot: { ipa: 'ˈkæn.ɑːt', pos: 'verb', vi: 'không thể', ex: 'Online chat cannot replace hands-on diagnosis.' },
    entirely: { ipa: 'ɪnˈtaɪr.li', pos: 'adv', vi: 'hoàn toàn, tuyệt đối', ex: 'Symptoms have not entirely disappeared.' },
    replace: { ipa: 'rɪˈpleɪs', pos: 'verb', vi: 'thay thế', ex: 'AI tools assist doctors rather than replace them.' },
    overuse: { ipa: 'ˌoʊ.vɚˈjuːs', pos: 'noun', vi: 'sự lạm dụng, dùng quá mức', ex: 'The overuse of antibiotics is dangerous.' },
    'broad-spectrum': { ipa: 'ˌbrɔːdˈspek.trəm', pos: 'adj', vi: 'phổ rộng (kháng sinh)', ex: 'Broad-spectrum antibiotics target many bacteria.' },
    antibiotics: { ipa: 'ˌæn.tɪ.baɪˈɑː.tɪks', pos: 'noun', vi: 'thuốc kháng sinh', ex: 'Antibiotics do not cure viral infections.' },
    has: { ipa: 'hæz', pos: 'verb', vi: 'đã (trợ động từ thì hiện tại hoàn thành)', ex: 'Research has shown clear benefits.' },
    accelerated: { ipa: 'əkˈsel.ə.reɪ.tɪd', pos: 'verb', vi: 'đẩy nhanh, làm tăng tốc', ex: 'Misuse has accelerated drug resistance.' },
    emergence: { ipa: 'ɪˈmɜːr.dʒəns', pos: 'noun', vi: 'sự xuất hiện, sự nổi lên', ex: 'The emergence of new bacterial strains.' },
    'drug-resistant': { ipa: 'ˌdrʌɡ.rɪˈzɪs.tənt', pos: 'adj', vi: 'kháng thuốc', ex: 'Drug-resistant infections are harder to treat.' },
    bacteria: { ipa: 'bækˈtɪr.i.ə', pos: 'noun', vi: 'vi khuẩn', ex: 'Harmful bacteria can multiply quickly.' }
  };

  // Dữ liệu bài học đa câu (Hỗ trợ Video YouTube đồng bộ mốc thời gian + Audio ELLLO / US Neural + 3 Chế độ)
  const DEFAULT_STUDIO_LESSONS = {
    B1: [
      {
        id: 'lis_b1_1',
        category: 'BBC Learning English · Hội thoại Đời sống',
        title: 'Easy English Conversations: Daily Routine & Swimming',
        youtubeId: 'zN6V2M3bE8M',
        sourceLabel: 'BBC Learning English / YouTube & US Studio',
        segments: [
          {
            text: 'Easy English conversations. How often do you go swimming? Hello, Buli. Hi Sian! What is your daily routine?',
            vi: 'Hội thoại tiếng Anh dễ hiểu. Bạn có thường đi bơi không? Xin chào Buli. Chào Sian! Lịch trình hàng ngày của bạn là gì?',
            start: 0,
            end: 13,
            ipaNote: 'Chú ý tên riêng "Sian" đọc là /ʃɑːn/ và nối âm nhẹ ở "How often do you" /haʊ ˈɔːfən də juː/.'
          },
          {
            text: 'Well, I always get up at seven o\'clock. I usually have fruit and yogurt for breakfast.',
            vi: 'À, mình luôn thức dậy vào lúc 7 giờ đúng. Mình thường ăn trái cây và sữa chua cho bữa sáng.',
            start: 14,
            end: 23,
            ipaNote: 'Nối âm tự nhiên: "get up at" /ɡet ʌp æt/, trọng âm rơi vào "always", "seven", "usually", "fruit", "yogurt".'
          },
          {
            text: 'Then I go to work by bus and check my emails in the morning.',
            vi: 'Sau đó mình đi làm bằng xe buýt và kiểm tra thư điện tử vào buổi sáng.',
            start: 24,
            end: 31,
            ipaNote: 'Chú ý âm đuôi /-z/ trong từ "emails" /ˈiː.meɪlz/ và cụm phương tiện "by bus".'
          },
          {
            text: 'How often do you go swimming during the week?',
            vi: 'Bạn đi bơi bao nhiêu lần trong tuần?',
            start: 32,
            end: 37,
            ipaNote: 'Câu hỏi Wh-question xuống giọng nhẹ ở cuối câu "during the week".'
          },
          {
            text: 'I go swimming twice a week because it helps me stay healthy and relax after work.',
            vi: 'Mình đi bơi hai lần một tuần vì nó giúp mình giữ sức khỏe và thư giãn sau giờ làm việc.',
            start: 38,
            end: 47,
            ipaNote: 'Nối âm cực hay gặp trong VSTEP: "twice a week" /twaɪs ə wiːk/ và âm cuối /-ps/ trong "helps".'
          }
        ],
        mcq: {
          question: 'Theo đoạn hội thoại, nhân vật thường ăn gì vào bữa sáng và đi bơi bao nhiêu lần mỗi tuần?',
          options: [
            'Ăn trái cây với sữa chua vào bữa sáng và đi bơi 2 lần/tuần',
            'Chỉ uống cà phê sáng và đi bơi mỗi ngày',
            'Ăn bánh mì lúc 9 giờ sáng và không biết bơi',
            'Đi làm bằng tàu điện ngầm và tập chạy bộ buổi tối'
          ],
          answer: 0,
          evidenceIdx: 1,
          explain: 'Đáp án nằm ở Câu #2 ("I usually have fruit and yogurt for breakfast") và Câu #5 ("I go swimming twice a week").'
        },
        speakingPrompt: {
          question: 'VSTEP Speaking Part 1: What is your daily routine, and what sport do you do to stay healthy?',
          hintVi: 'Gợi ý trả lời 3 ý: (1) Giờ thức dậy & bữa sáng -> (2) Công việc/học tập ban ngày -> (3) Môn thể thao yêu thích (như bơi lội/chạy bộ) giúp giải tỏa căng thẳng.'
        }
      },
      {
        id: 'lis_b1_2',
        category: 'Giao tiếp Y khoa & Phòng khám (B1)',
        title: 'Khám triệu chứng đau bụng cấp & Hướng dẫn dùng thuốc',
        youtubeId: '',
        sourceLabel: 'Clinical Dialogue · Chuẩn US Neural',
        segments: [
          {
            text: 'How long have you been experiencing this sharp abdominal pain?',
            vi: 'Bạn đã bị cơn đau bụng nhói này bao lâu rồi?',
            start: 0,
            end: 6,
            ipaNote: 'Nối âm "have you been" /həv jə bɪn/, nhấn rõ "experiencing", "sharp", "abdominal pain".'
          },
          {
            text: 'The pain started yesterday evening and moved to my lower right side.',
            vi: 'Cơn đau bắt đầu từ tối hôm qua và đã lan xuống vùng bụng dưới bên phải của tôi.',
            start: 6,
            end: 13,
            ipaNote: 'Chú ý phát âm đuôi /-ɪd/ trong "started" /ˈstɑːr.tɪd/ và /-d/ trong "moved" /muːvd/.'
          },
          {
            text: 'I understand. We need to run a blood test and an abdominal ultrasound immediately.',
            vi: 'Tôi hiểu rồi. Chúng tôi cần làm xét nghiệm máu và siêu âm ổ bụng ngay lập tức.',
            start: 13,
            end: 21,
            ipaNote: 'Nhấn trọng âm từ "ultrasound" /ˈʌl.trə.saʊnd/ ở âm tiết đầu và "immediately" /ɪˈmiː.di.ət.li/.'
          },
          {
            text: 'Please take one tablet twice a day after meals for seven days.',
            vi: 'Vui lòng uống mỗi lần 1 viên, ngày 2 lần sau bữa ăn trong vòng 7 ngày.',
            start: 21,
            end: 28,
            ipaNote: 'Cụm chỉ định thuốc kinh điển: "twice a day" /twaɪs ə deɪ/, phát âm rõ âm /-z/ ở "meals" và "days".'
          }
        ],
        mcq: {
          question: 'Bác sĩ chỉ định thực hiện cận lâm sàng gì ngay lập tức khi bệnh nhân báo đau lan xuống vùng bụng dưới bên phải?',
          options: [
            'Xét nghiệm máu (blood test) và siêu âm ổ bụng (abdominal ultrasound)',
            'Chỉ cho thuốc giảm đau về nhà theo dõi 1 tháng',
            'Chụp cộng hưởng từ sọ não',
            'Yêu cầu bệnh nhân nhịn uống nước trong 3 ngày'
          ],
          answer: 0,
          evidenceIdx: 2,
          explain: 'Trong Câu #3, bác sĩ nói rõ: "We need to run a blood test and an abdominal ultrasound immediately."'
        },
        speakingPrompt: {
          question: 'Roleplay Lâm sàng / VSTEP B1: A patient complains of sharp abdominal pain. Ask about the onset and explain the tests needed.',
          hintVi: 'Sử dụng cấu trúc Câu #1 (How long have you been experiencing...) và Câu #3 (We need to run a blood test and an ultrasound...).'
        }
      },
      {
        id: 'lis_b1_3',
        category: 'ELLLO.org #1430 · Sức khỏe & Lối sống (B1)',
        title: 'Taking Care of Physical Health & Immune System',
        youtubeId: '',
        sourceLabel: 'ELLLO.org Health Series · Chuẩn US Neural',
        segments: [
          {
            text: 'Getting enough sleep and regular exercise can significantly boost your immune system.',
            vi: 'Ngủ đủ giấc và tập thể dục đều đặn có thể tăng cường đáng kể hệ miễn dịch của bạn.',
            start: 0,
            end: 8,
            ipaNote: 'Nhấn mạnh các cụm danh từ cốt lõi: "enough sleep", "regular exercise", "immune system".'
          },
          {
            text: 'We also need to reschedule our weekly team meeting to Thursday afternoon so everyone can rest.',
            vi: 'Chúng ta cũng cần dời lịch buổi họp nhóm hàng tuần sang chiều thứ Năm để mọi người có thời gian nghỉ ngơi.',
            start: 8,
            end: 16,
            ipaNote: 'Phân biệt rõ "Tuesday" (Thứ Ba) và "Thursday" (/ˈθɜːrz.deɪ/ - Thứ Năm có âm /θ/ đặt lưỡi giữa hai hàm răng).'
          }
        ],
        mcq: {
          question: 'Hai yếu tố tự nhiên nào giúp tăng cường đáng kể hệ miễn dịch được nhắc đến trong bài?',
          options: [
            'Ngủ đủ giấc (enough sleep) và tập thể dục đều đặn (regular exercise)',
            'Làm việc khuya và uống nhiều nước ngọt có ga',
            'Dời lịch họp sang ngày Chủ nhật',
            'Sử dụng kháng sinh liều cao mỗi ngày'
          ],
          answer: 0,
          evidenceIdx: 0,
          explain: 'Câu #1 khẳng định: "Getting enough sleep and regular exercise can significantly boost your immune system."'
        },
        speakingPrompt: {
          question: 'VSTEP Speaking Part 2: How do you maintain a healthy lifestyle when you have a busy schedule?',
          hintVi: 'Kết hợp từ vựng "getting enough sleep", "regular exercise", và "boost my immune system".'
        }
      }
    ],
    B2: [
      {
        id: 'lis_b2_1',
        category: 'Y khoa - Lâm sàng Chuyên sâu (B2)',
        title: 'Chẩn đoán Viêm ruột thừa cấp & Biến chứng Viêm phúc mạc',
        youtubeId: '',
        sourceLabel: 'Clinical Grand Rounds · Chuẩn US Neural',
        segments: [
          {
            text: 'Delayed diagnosis of acute appendicitis can lead to perforation and generalized peritonitis.',
            vi: 'Chẩn đoán muộn viêm ruột thừa cấp có thể dẫn đến thủng tạng và viêm phúc mạc toàn thể.',
            start: 0,
            end: 8,
            ipaNote: 'Chú ý âm đuôi /-d/ trong "Delayed", trọng âm "per-fo-RA-tion" /ˌpɜːr.fəˈreɪ.ʃən/ và "pe-ri-to-NI-tis" /ˌper.ɪ.təˈnaɪ.tɪs/.'
          },
          {
            text: 'Physical examination revealed localized abdominal resistance and positive rebound tenderness.',
            vi: 'Thăm khám thực thể phát hiện đề kháng thành bụng khu trú và dấu hiệu cảm ứng phúc mạc (phản ứng dội) dương tính.',
            start: 8,
            end: 16,
            ipaNote: 'Cụm lâm sàng đắt giá: "localized abdominal resistance" và "positive rebound tenderness".'
          },
          {
            text: 'This clinical condition requires immediate surgical consultation and broad-spectrum antibiotics.',
            vi: 'Tình trạng lâm sàng này đòi hỏi phải hội chẩn ngoại khoa ngay lập tức và dùng kháng sinh phổ rộng.',
            start: 16,
            end: 24,
            ipaNote: 'Chú ý phát âm "surgical consultation" /ˈsɜːr.dʒɪ.kəl ˌkɑːn.sʌlˈteɪ.ʃən/.'
          }
        ],
        mcq: {
          question: 'Biến chứng nguy hiểm nào xảy ra khi chẩn đoán viêm ruột thừa cấp (acute appendicitis) bị chậm trễ?',
          options: [
            'Thủng ruột thừa (perforation) và viêm phúc mạc toàn thể (generalized peritonitis)',
            'Chỉ gây đau đầu nhẹ và tự khỏi sau 24 giờ',
            'Làm giảm nhịp tim tạm thời',
            'Không cần can thiệp ngoại khoa'
          ],
          answer: 0,
          evidenceIdx: 0,
          explain: 'Câu #1 nêu rõ cấu trúc nhân quả: "Delayed diagnosis of acute appendicitis can lead to perforation and generalized peritonitis."'
        },
        speakingPrompt: {
          question: 'Clinical Presentation / VSTEP B2: Summarize the physical examination findings and management of acute appendicitis with suspected peritonitis.',
          hintVi: 'Dùng chuỗi thuật ngữ: localized abdominal resistance -> positive rebound tenderness -> immediate surgical consultation.'
        }
      },
      {
        id: 'lis_b2_2',
        category: 'Học thuật VSTEP Part 3 & Y tế số (B2)',
        title: 'Telemedicine & Global Antibiotic Resistance',
        youtubeId: '',
        sourceLabel: 'VSTEP Academic Lecture · Chuẩn US Neural',
        segments: [
          {
            text: 'Although telemedicine offers unprecedented convenience, it cannot entirely replace physical examinations.',
            vi: 'Mặc dù y tế từ xa mang lại sự tiện lợi chưa từng có, nó không thể thay thế hoàn toàn việc thăm khám trực tiếp.',
            start: 0,
            end: 8,
            ipaNote: 'Từ vựng ăn điểm C1/B2: "unprecedented" /ʌnˈpres.ɪ.den.tɪd/ (chưa từng có tiền lệ).'
          },
          {
            text: 'The overuse of broad-spectrum antibiotics has accelerated the emergence of drug-resistant bacteria.',
            vi: 'Việc lạm dụng kháng sinh phổ rộng đã đẩy nhanh sự xuất hiện của vi khuẩn kháng thuốc.',
            start: 8,
            end: 17,
            ipaNote: 'Nối âm học thuật: "has accelerated" /həz əkˈsel.ə.reɪ.tɪd/, "emergence of" /ɪˈmɜːr.dʒəns əv/.'
          }
        ],
        mcq: {
          question: 'Quan điểm chính của bài giảng về y tế từ xa (telemedicine) và kháng sinh là gì?',
          options: [
            'Y tế từ xa rất tiện lợi nhưng không thể thay thế hoàn toàn khám trực tiếp, và lạm dụng kháng sinh làm tăng vi khuẩn kháng thuốc',
            'Y tế từ xa đã thay thế 100% các bệnh viện và kháng sinh phổ rộng hoàn toàn vô hại',
            'Vi khuẩn kháng thuốc đang giảm dần nhờ công nghệ số',
            'Khám lâm sàng trực tiếp không còn cần thiết trong y học hiện đại'
          ],
          answer: 0,
          evidenceIdx: 0,
          explain: 'Kết hợp mệnh đề chính ở Câu #1 ("cannot entirely replace physical examinations") và Câu #2 ("accelerated the emergence of drug-resistant bacteria").'
        },
        speakingPrompt: {
          question: 'VSTEP Speaking Part 3: Should online medical consultations completely replace traditional hospital visits?',
          hintVi: 'Sử dụng cấu trúc nhượng bộ B2: "Although telemedicine offers unprecedented convenience, it cannot entirely replace physical examinations because..."'
        }
      }
    ]
  };

  // Trạng thái nội bộ của Studio
  let curLessonIdx = 0;
  let curSegIdx = 0;
  let studioMode = 'shadowing'; // 'shadowing' | 'dictation' | 'vstep'
  let mediaTab = 'audio'; // 'video' | 'audio'
  let leftSubTab = 'subtitles'; // 'subtitles' | 'guide'
  let showIPA = true;
  let showTrans = true;
  let showLeftSubs = true;
  let loopSegment = false;
  let mergeNext = false; // Ghép câu kế tiếp (1/2 -> 2/2)
  let playbackSpeed = 1.0;

  // Trạng thái từ đang mở Popover tra nghĩa
  let activePopoverWord = null;

  // Trạng thái Ghi âm giọng thật (MediaRecorder + SpeechRecognition)
  let isRecording = false;
  let recordSeconds = 0;
  let recordTimerId = null;
  let mediaRecorder = null;
  let recordedChunks = [];
  let speechRec = null;
  let liveTranscript = '';

  // Bộ nhớ kết quả thu âm theo từng câu: key = `${lessonId}_${segIdx}_${mergeNext ? 2 : 1}`
  // value = { transcript, audioUrl, durationSec, wordResults: [{ word, status: 'correct'|'near'|'wrong', spokenWord }], pct, aiCoachHtml }
  const recordingStore = {};

  function getCustomLessons() {
    try {
      const raw = localStorage.getItem(LS_STUDIO_CUSTOM_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveCustomLessons(list) {
    try {
      localStorage.setItem(LS_STUDIO_CUSTOM_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  function getLessonsForLevel(lv) {
    const base = DEFAULT_STUDIO_LESSONS[lv] || DEFAULT_STUDIO_LESSONS.B1;
    const custom = getCustomLessons().filter((c) => !c.level || c.level === lv);
    return [...base, ...custom];
  }

  function cleanWordToken(w) {
    return String(w || '')
      .toLowerCase()
      .replace(/^[^a-z0-9']+|[^a-z0-9']+$/g, '');
  }

  // Tìm từ trong Kho từ vựng của người dùng hoặc từ điển tích hợp
  function lookupWordInfo(rawWord) {
    const clean = cleanWordToken(rawWord);
    if (!clean) {
      return { word: rawWord, ipa: '', pos: 'word', vi: '', ex: '' };
    }

    // 1. Tìm trong Kho từ vựng cá nhân (LocalStorage)
    try {
      const rawVault = localStorage.getItem('lexicontext_master_db_unified');
      if (rawVault) {
        const db = JSON.parse(rawVault);
        const found = (db.words || []).find((w) => cleanWordToken(w.word) === clean);
        if (found) {
          return {
            word: found.word,
            ipa: String(found.ipa || '').replace(/^\/|\/$/g, ''),
            pos: found.pos || 'word',
            vi: found.meaning || '',
            ex: found.example || '',
            inVault: true
          };
        }
      }
    } catch (e) {}

    // 2. Tìm trong từ điển tích hợp sẵn
    if (BUILTIN_WORD_DICT[clean]) {
      const d = BUILTIN_WORD_DICT[clean];
      return {
        word: clean,
        ipa: d.ipa,
        pos: d.pos,
        vi: d.vi,
        ex: d.ex,
        inVault: false
      };
    }

    // 3. Bộ quy tắc suy luận phiên âm IPA tự động chuẩn xác cho từ tiếng Anh bất kỳ
    const autoIpa = approximateEnglishIPA(clean);
    return {
      word: clean,
      ipa: autoIpa,
      pos: 'word',
      vi: 'Bấm "🔊 US" để nghe hoặc lưu vào Kho từ vựng để AI phân tích chi tiết',
      ex: '',
      inVault: false
    };
  }

  function approximateEnglishIPA(word) {
    if (!word) return '';
    let s = word.toLowerCase();
    s = s
      .replace(/tion$/g, 'ʃən')
      .replace(/sion$/g, 'ʒən')
      .replace(/ous$/g, 'əs')
      .replace(/itis$/g, 'ˈaɪ.tɪs')
      .replace(/ology$/g, 'ˈɑː.lə.dʒi')
      .replace(/ing$/g, 'ɪŋ')
      .replace(/ed$/g, 'd')
      .replace(/ly$/g, 'li')
      .replace(/ment$/g, 'mənt')
      .replace(/ness$/g, 'nəs')
      .replace(/ph/g, 'f')
      .replace(/sh/g, 'ʃ')
      .replace(/ch/g, 'tʃ')
      .replace(/th/g, 'θ')
      .replace(/ee/g, 'iː')
      .replace(/ea/g, 'iː')
      .replace(/oo/g, 'uː')
      .replace(/ou/g, 'aʊ')
      .replace(/ow/g, 'aʊ')
      .replace(/ai/g, 'eɪ')
      .replace(/ay/g, 'eɪ')
      .replace(/oa/g, 'oʊ')
      .replace(/igh/g, 'aɪ')
      .replace(/qu/g, 'kw')
      .replace(/c(?=[eiy])/g, 's')
      .replace(/c/g, 'k');
    return s;
  }

  // Tính khoảng cách Levenshtein để chấm từ Gần đúng (Thẻ Vàng ▲) vs Đúng (Thẻ Xanh ✓) vs Sai (Thẻ Đỏ ✗)
  function wordSimilarity(a, b) {
    const s1 = cleanWordToken(a);
    const s2 = cleanWordToken(b);
    if (!s1 || !s2) return 0;
    if (s1 === s2) return 1;
    // Khớp số nhiều / quá khứ đơn giản (VD: conversation vs conversations)
    if (s1 + 's' === s2 || s2 + 's' === s1 || s1 + 'ed' === s2 || s2 + 'ed' === s1) {
      return 0.82;
    }
    const m = s1.length;
    const n = s2.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      }
    }
    const maxLen = Math.max(m, n);
    return maxLen ? (maxLen - dp[m][n]) / maxLen : 0;
  }

  // So khớp câu mục tiêu và câu người học đọc thành mảng Thẻ từ Xanh (correct) / Vàng (near) / Đỏ (wrong)
  function evaluateSpokenWords(targetText, spokenText) {
    const targetTokens = String(targetText || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const spokenTokens = String(spokenText || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    const usedSpoken = new Set();
    let scoreSum = 0;

    const wordResults = targetTokens.map((rawTarget, tIdx) => {
      const cleanT = cleanWordToken(rawTarget);
      if (!cleanT) {
        return { word: rawTarget, clean: '', status: 'correct', spokenWord: rawTarget };
      }

      let bestIdx = -1;
      let bestSim = 0;

      // Ưu tiên tìm từ khớp trong cửa sổ lân cận vị trí câu
      for (let sIdx = 0; sIdx < spokenTokens.length; sIdx++) {
        if (usedSpoken.has(sIdx)) continue;
        const sim = wordSimilarity(cleanT, spokenTokens[sIdx]);
        const distPenalty = Math.abs(sIdx - tIdx) > 5 ? 0.08 : 0;
        const adjSim = Math.max(0, sim - distPenalty);
        if (adjSim > bestSim) {
          bestSim = adjSim;
          bestIdx = sIdx;
        }
      }

      if (bestIdx !== -1 && bestSim >= 0.92) {
        usedSpoken.add(bestIdx);
        scoreSum += 1;
        return {
          word: rawTarget,
          clean: cleanT,
          status: 'correct',
          spokenWord: spokenTokens[bestIdx]
        };
      }

      if (bestIdx !== -1 && bestSim >= 0.62) {
        usedSpoken.add(bestIdx);
        scoreSum += 0.65;
        return {
          word: rawTarget,
          clean: cleanT,
          status: 'near',
          spokenWord: spokenTokens[bestIdx]
        };
      }

      // Tìm từ người học đã nói thay thế vào vị trí này (nếu có) để AI chỉ lỗi thay thế từ
      const subCandidate =
        tIdx < spokenTokens.length && !usedSpoken.has(tIdx) ? spokenTokens[tIdx] : '';

      return {
        word: rawTarget,
        clean: cleanT,
        status: 'wrong',
        spokenWord: subCandidate
      };
    });

    const total = targetTokens.length || 1;
    const correctCount = wordResults.filter((w) => w.status === 'correct').length;
    const nearCount = wordResults.filter((w) => w.status === 'near').length;
    const pct = Math.round((scoreSum / total) * 1000) / 10;

    return {
      wordResults,
      correctCount,
      nearCount,
      total: targetTokens.length,
      pct
    };
  }

  // Tạo nội dung nhận xét phát âm 4 mục giống hệt cấu trúc "AI Huấn luyện phát âm" trong video Senglish
  function buildAICoachFeedbackHTML(targetText, spokenText, evalResult, esc) {
    const correctWords = evalResult.wordResults
      .filter((w) => w.status === 'correct')
      .map((w) => w.word);
    const nearWords = evalResult.wordResults.filter((w) => w.status === 'near');
    const wrongWords = evalResult.wordResults.filter((w) => w.status === 'wrong');

    const goodSummary =
      correctWords.length > 0
        ? `Bạn đã phát âm đúng và rõ ràng <b>${correctWords.length}/${evalResult.total} từ</b> (bao gồm: <i>"${esc(
            correctWords.slice(0, 8).join(' ')
          )}${correctWords.length > 8 ? '...' : ''}"</i>).`
        : 'Bạn đã bắt đầu làm quen với nhịp điệu của câu.';

    const improvements = [];
    wrongWords.forEach((w) => {
      const info = lookupWordInfo(w.clean);
      if (w.spokenWord && cleanWordToken(w.spokenWord) !== w.clean) {
        improvements.push(
          `<li><b>Thay thế từ:</b> Bạn đã nói <span class="text-rose-400 font-mono">"${esc(
            w.spokenWord
          )}"</span> thay vì <span class="text-emerald-400 font-mono">"${esc(
            w.word
          )}"</span> (/${esc(info.ipa)}/). Cần chú ý nghe kỹ và phát âm đúng từ trong câu mẫu.</li>`
        );
      } else {
        improvements.push(
          `<li><b>Từ bị bỏ sót / chưa rõ âm:</b> Từ <span class="text-rose-400 font-mono">"${esc(
            w.word
          )}"</span> (/${esc(
            info.ipa
          )}/) chưa được nhận diện rõ. Hãy bấm trực tiếp vào thẻ từ màu đỏ để nghe lại âm chuẩn Mỹ.</li>`
        );
      }
    });

    nearWords.forEach((w) => {
      const info = lookupWordInfo(w.clean);
      improvements.push(
        `<li><b>Lưu ý âm cuối / trọng âm:</b> Từ <span class="text-amber-300 font-mono">"${esc(
          w.word
        )}"</span> (/${esc(info.ipa)}/) bạn đọc là <i>"${esc(
          w.spokenWord
        )}"</i> — đã gần đúng nhưng cần bật rõ âm cuối hơn.</li>`
      );
    });

    if (improvements.length === 0) {
      improvements.push(
        '<li>Tuyệt vời! Bạn đã phát âm khớp toàn bộ các từ trong câu mẫu. Hãy thử tăng tốc độ lên <b>1.25x</b> để luyện phản xạ tự nhiên hơn.</li>'
      );
    }

    return `
      <div class="space-y-3 text-xs sm:text-sm leading-relaxed">
        <p class="text-mute">Chào bạn, tôi là huấn luyện viên phát âm của bạn. Dưới đây là đánh giá chi tiết cho phần thực hành vừa rồi:</p>
        <div>
          <b class="text-fg">1. Đánh giá chung:</b> Bạn đã có một phần luyện tập với độ chính xác <b class="${
            evalResult.pct >= 80
              ? 'text-emerald-400'
              : evalResult.pct >= 55
              ? 'text-amber-300'
              : 'text-rose-400'
          }">${evalResult.pct}%</b> (${evalResult.correctCount}/${evalResult.total} từ chuẩn). ${
      evalResult.pct >= 80
        ? 'Ngữ điệu câu của bạn rất tự nhiên và rõ chữ!'
        : 'Tuy nhiên, vẫn còn một số điểm nhỏ cần chú ý để câu nói của bạn tự nhiên và chính xác hơn.'
    }
        </div>
        <div>
          <b class="text-emerald-400">2. Điểm tốt:</b>
          <ul class="list-disc pl-5 mt-1 space-y-1">
            <li>${goodSummary}</li>
          </ul>
        </div>
        <div>
          <b class="text-amber-300">3. Các điểm cần cải thiện:</b>
          <ul class="list-disc pl-5 mt-1 space-y-1.5">
            ${improvements.slice(0, 5).join('')}
          </ul>
        </div>
        <div>
          <b class="text-sky-400">4. Mẹo luyện tập:</b>
          <ul class="list-disc pl-5 mt-1 space-y-1">
            <li><b>Nghe và lặp lại:</b> Bấm trực tiếp vào từng thẻ từ màu <b>Đỏ (✗)</b> hoặc <b>Vàng (▲)</b> bên dưới để nghe lại âm chuẩn US và nhại theo.</li>
            <li><b>Tách cụm:</b> Bấm nút <b>Tách cụm</b> ở góc trên câu để đọc theo từng nhịp thở 1.5s trước khi ghép cả câu.</li>
          </ul>
        </div>
        <div class="pt-2 border-t border-line/50 text-xs text-mute">
          <b>5. Thử lại lần nữa:</b> Hãy thử đọc lại câu: <i>"${esc(targetText)}"</i> một lần nữa nhé!
        </div>
        <div id="studio-ai-extra-slot" class="hidden pt-2 border-t border-line/50 text-xs"></div>
      </div>
    `;
  }

  function getActiveLessonAndSegment(lv) {
    const list = getLessonsForLevel(lv);
    if (curLessonIdx >= list.length) curLessonIdx = 0;
    const lesson = list[curLessonIdx] || list[0];
    const segs = lesson.segments || [];
    if (curSegIdx >= segs.length) curSegIdx = 0;

    const firstSeg = segs[curSegIdx] || { text: '', vi: '', start: 0, end: 8, ipaNote: '' };
    const secondSeg =
      mergeNext && curSegIdx + 1 < segs.length ? segs[curSegIdx + 1] : null;

    const combinedText = secondSeg
      ? `${firstSeg.text.trim()} ${secondSeg.text.trim()}`
      : firstSeg.text.trim();
    const combinedVi = secondSeg
      ? `${firstSeg.vi.trim()} ${secondSeg.vi.trim()}`
      : firstSeg.vi.trim();
    const startSec = firstSeg.start || 0;
    const endSec = secondSeg ? secondSeg.end || startSec + 12 : firstSeg.end || startSec + 7;
    const ipaNote = secondSeg
      ? `${firstSeg.ipaNote || ''} · ${secondSeg.ipaNote || ''}`
      : firstSeg.ipaNote || '';

    const recKey = `${lesson.id}_${curSegIdx}_${mergeNext ? 2 : 1}`;
    const savedRec = recordingStore[recKey] || null;

    return {
      list,
      lesson,
      segs,
      firstSeg,
      secondSeg,
      combinedText,
      combinedVi,
      startSec,
      endSec,
      ipaNote,
      recKey,
      savedRec
    };
  }

  function calcLessonStats(lesson) {
    const segs = lesson.segments || [];
    if (!segs.length) return { doneCount: 0, avgPct: null };
    let doneCount = 0;
    let sumPct = 0;
    segs.forEach((_, idx) => {
      const r1 = recordingStore[`${lesson.id}_${idx}_1`];
      const r2 = recordingStore[`${lesson.id}_${idx}_2`];
      const r = r2 || r1;
      if (r && typeof r.pct === 'number') {
        doneCount++;
        sumPct += r.pct;
      }
    });
    return {
      doneCount,
      avgPct: doneCount > 0 ? Math.round((sumPct / doneCount) * 10) / 10 : null
    };
  }

  function render(lv, state) {
    const esc = global.LexiAcademy.esc;
    const ctx = getActiveLessonAndSegment(lv);
    const {
      list,
      lesson,
      segs,
      combinedText,
      combinedVi,
      startSec,
      endSec,
      ipaNote,
      savedRec
    } = ctx;

    const wordsArr = combinedText.split(/\s+/).filter(Boolean);
    const stats = calcLessonStats(lesson);
    const progressPct = segs.length ? Math.round((stats.doneCount / segs.length) * 100) : 0;

    const draftKey = `lis_dict_${lesson.id}_${curSegIdx}`;
    const savedDictation =
      state && state.drafts && state.drafts[draftKey] ? state.drafts[draftKey] : '';
    const dictResult = savedDictation
      ? global.LexiAcademy.compareTokens(combinedText, savedDictation)
      : null;

    // Tạo giao diện từng từ kèm IPA bên dưới (chạm vào từ để mở Popover tra nghĩa & lưu từ)
    const interactiveWordsHTML = wordsArr
      .map((rawW, wIdx) => {
        const cleanW = cleanWordToken(rawW);
        const info = lookupWordInfo(cleanW);
        const isPopOpen = activePopoverWord && activePopoverWord.idx === wIdx;
        return `
          <button
            type="button"
            data-studio-word="${esc(rawW)}"
            data-studio-word-idx="${wIdx}"
            class="group inline-flex flex-col items-center px-1.5 py-1 rounded-lg transition cursor-pointer select-none ${
              isPopOpen
                ? 'bg-pink-500/20 ring-1 ring-pink-400/60'
                : 'hover:bg-line/30'
            }"
            title="Chạm để nghe phát âm & tra nghĩa từ '${esc(cleanW)}'"
          >
            <span class="text-base sm:text-lg font-bold tracking-tight ${
              isPopOpen ? 'text-pink-400' : 'text-fg group-hover:text-pri'
            }">${esc(rawW)}</span>
            ${
              showIPA
                ? `<span class="text-[11px] font-mono text-mute leading-tight mt-0.5">${esc(
                    info.ipa || cleanW
                  )}</span>`
                : ''
            }
          </button>
        `;
      })
      .join('');

    // Thẻ Từ Điển Nổi (Popover) khi người dùng bấm vào 1 từ bất kỳ trong câu
    let wordPopoverHTML = '';
    if (activePopoverWord) {
      const pInfo = lookupWordInfo(activePopoverWord.word);
      wordPopoverHTML = `
        <div id="studio-word-popover" class="inset p-3.5 rounded-xl border border-pink-500/40 bg-pink-500/5 space-y-2 text-xs shadow-lg">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-line/50 pb-2">
            <div class="flex items-center gap-2">
              <b class="text-base text-fg font-bold">${esc(pInfo.word)}</b>
              <span class="font-mono text-pink-400">/${esc(pInfo.ipa)}/</span>
              <span class="text-mute italic">(${esc(pInfo.pos)})</span>
              <button type="button" data-pop-speak="${esc(
                pInfo.word
              )}" class="px-2 py-0.5 rounded-md border border-sky-400/40 bg-sky-500/10 text-sky-300 font-mono font-bold hover:bg-sky-500/20">
                🔊 US
              </button>
            </div>
            <div class="flex items-center gap-1.5">
              <button
                type="button"
                id="studio-pop-save-word"
                data-word="${esc(pInfo.word)}"
                data-ipa="/${esc(pInfo.ipa)}/"
                data-pos="${esc(pInfo.pos)}"
                data-meaning="${esc(pInfo.vi)}"
                data-ex="${esc(combinedText)}"
                data-extrans="${esc(combinedVi)}"
                class="px-2.5 py-1 rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-300 font-bold hover:bg-pink-500/30 whitespace-nowrap"
              >
                ${pInfo.inVault ? '✓ Đã có trong Kho từ' : '⭐ Lưu vào Kho từ vựng'}
              </button>
              <button type="button" id="studio-pop-close" class="px-2 py-1 rounded-lg border border-line text-mute hover:text-fg">✕</button>
            </div>
          </div>
          <div class="space-y-1">
            <div><b class="text-emerald-400">Nghĩa:</b> <span class="text-fg font-medium">${esc(
              pInfo.vi
            )}</span></div>
            ${
              pInfo.ex
                ? `<div class="text-mute"><b>Ví dụ:</b> <i>"${esc(pInfo.ex)}"</i></div>`
                : ''
            }
          </div>
        </div>
      `;
    }

    // Tạo các ô từ ẩn [ •••• ] hoặc Thẻ từ chấm điểm Xanh (✓) / Vàng (▲) / Đỏ (✗) giống video Senglish
    const wordSlotsHTML = savedRec
      ? savedRec.wordResults
          .map((wr) => {
            const cls =
              wr.status === 'correct'
                ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
                : wr.status === 'near'
                ? 'border-amber-500/50 bg-amber-500/15 text-amber-300 hover:bg-amber-500/25'
                : 'border-rose-500/50 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25';
            const sym = wr.status === 'correct' ? '✓' : wr.status === 'near' ? '▲' : '✗';
            return `
              <button
                type="button"
                data-chip-speak="${esc(wr.word)}"
                class="px-2.5 py-1.5 rounded-lg border font-mono text-xs font-bold transition cursor-pointer inline-flex items-center gap-1.5 ${cls}"
                title="Bấm để nghe lại phát âm chuẩn US của từ '${esc(wr.word)}'"
              >
                <span>${esc(wr.word.toLowerCase())}</span>
                <span>${sym}</span>
              </button>
            `;
          })
          .join('')
      : wordsArr
          .map((w) => {
            const dots = '•'.repeat(Math.max(3, Math.min(8, cleanWordToken(w).length)));
            return `
              <span class="px-3 py-1.5 rounded-lg border border-line/60 bg-inset/60 text-mute font-mono text-xs tracking-widest select-none">
                ${dots}
              </span>
            `;
          })
          .join('');

    return `
      <div class="space-y-4">
        <!-- THANH CÔNG CỤ STUDIO TRÊN ĐỈNH: CHỌN BÀI HỌC + 3 CHẾ ĐỘ (SHADOWING | DICTATION | NGHE VSTEP) -->
        <div class="card p-3.5 sm:p-4 space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <!-- Bên trái: Chọn bài học & Nút Thêm bài từ YouTube / ELLLO -->
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs font-mono font-bold text-pink-400">🎙️ Talk Studio (${lv})</span>
              <select id="studio-lesson-select" class="inp !w-auto !py-1.5 !px-3 !text-xs font-semibold max-w-[260px] sm:max-w-[360px]">
                ${list
                  .map(
                    (it, idx) =>
                      `<option value="${idx}" ${idx === curLessonIdx ? 'selected' : ''}>${
                        idx + 1
                      }. ${esc(it.title)} (${it.segments.length} câu)</option>`
                  )
                  .join('')}
              </select>
              <button
                type="button"
                id="studio-open-import-modal"
                class="btn !py-1.5 !px-2.5 !text-xs border-pink-500/40 text-pink-400 hover:bg-pink-500/10 whitespace-nowrap"
                title="Dán link YouTube, ELLLO.org hoặc hội thoại bất kỳ để tạo bài luyện mới"
              >
                + Thêm bài (YouTube / ELLLO)
              </button>
            </div>

            <!-- Bên phải: Bộ chuyển đổi 3 Chế độ giống thanh đỉnh Senglish -->
            <div class="flex items-center gap-1 inset p-1 rounded-xl">
              <button
                type="button"
                data-studio-mode="shadowing"
                class="px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  studioMode === 'shadowing'
                    ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                    : 'text-mute hover:text-fg'
                }"
              >
                🗣️ Shadowing
              </button>
              <button
                type="button"
                data-studio-mode="dictation"
                class="px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  studioMode === 'dictation'
                    ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                    : 'text-mute hover:text-fg'
                }"
              >
                ⌨️ Dictation
              </button>
              <button
                type="button"
                data-studio-mode="vstep"
                class="px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  studioMode === 'vstep'
                    ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                    : 'text-mute hover:text-fg'
                }"
              >
                🎧 Nghe VSTEP
              </button>
            </div>
          </div>
        </div>

        <!-- BỐ CỤC STUDIO 2 CỘT (TRÁI 5/12: MEDIA & DANH SÁCH CÂU #1..#N | PHẢI 7/12: KHÔNG GIAN TƯƠNG TÁC CÂU) -->
        <div class="grid lg:grid-cols-12 gap-4 items-start">
          
          <!-- ================= CỘT TRÁI (5/12): VIDEO / AUDIO PLAYER & DANH SÁCH CÂU ================= -->
          <div class="lg:col-span-5 card p-4 space-y-3.5">
            <!-- Thanh chuyển đổi Video / Âm thanh -->
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs text-mute truncate">${esc(
                lesson.sourceLabel || lesson.category
              )}</span>
              <div class="flex items-center gap-1 inset p-1 rounded-lg shrink-0">
                <button
                  type="button"
                  data-studio-media="video"
                  class="px-2.5 py-1 rounded text-[11px] font-semibold transition whitespace-nowrap ${
                    mediaTab === 'video'
                      ? 'bg-pri/20 text-pri border border-pri/40'
                      : 'text-mute hover:text-fg'
                  }"
                >
                  📺 Video
                </button>
                <button
                  type="button"
                  data-studio-media="audio"
                  class="px-2.5 py-1 rounded text-[11px] font-semibold transition whitespace-nowrap ${
                    mediaTab === 'audio'
                      ? 'bg-pri/20 text-pri border border-pri/40'
                      : 'text-mute hover:text-fg'
                  }"
                >
                  🔊 Âm thanh
                </button>
              </div>
            </div>

            <!-- Khung Media Stage (YouTube Embed đồng bộ mốc câu hoặc US Neural Audio Stage) -->
            ${
              mediaTab === 'video' && lesson.youtubeId
                ? `
              <div class="relative rounded-xl overflow-hidden border border-line bg-black aspect-video">
                <iframe
                  id="studio-yt-iframe"
                  class="w-full h-full"
                  src="https://www.youtube.com/embed/${esc(
                    lesson.youtubeId
                  )}?start=${startSec}&end=${endSec}&autoplay=0&playsinline=1&rel=0"
                  title="${esc(lesson.title)}"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                ></iframe>
                <div class="absolute bottom-2 left-2 flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    id="studio-jump-first-btn"
                    class="px-2.5 py-1 rounded-lg bg-black/80 border border-white/20 text-white text-[11px] font-semibold hover:bg-black whitespace-nowrap"
                  >
                    ⏮ Đi đến câu đầu
                  </button>
                  <button
                    type="button"
                    id="studio-play-yt-seg-btn"
                    class="px-2.5 py-1 rounded-lg bg-pink-600/90 text-white text-[11px] font-bold hover:bg-pink-500 whitespace-nowrap"
                  >
                    ▶ Phát đoạn #${curSegIdx + 1} (${startSec}s–${endSec}s)
                  </button>
                </div>
              </div>
            `
                : `
              <div class="inset p-4 rounded-xl border border-line/70 space-y-3">
                <div class="flex items-center justify-between gap-2">
                  <div>
                    <div class="text-[11px] font-mono text-pink-400 font-bold">
                      CÂU #${curSegIdx + 1}${mergeNext ? ' + #' + (curSegIdx + 2) : ''} · CHUẨN MỸ (US NEURAL)
                    </div>
                    <div class="text-xs text-mute mt-0.5">
                      Tốc độ hiện tại: <b class="font-mono text-fg">${playbackSpeed}x</b> · Mốc: <span class="font-mono">${startSec}s – ${endSec}s</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <button
                      type="button"
                      id="studio-jump-first-btn"
                      class="btn !py-1.5 !px-2.5 !text-xs whitespace-nowrap"
                      title="Quay về câu #1"
                    >
                      ⏮ Câu #1
                    </button>
                    <button
                      type="button"
                      id="studio-left-play-us"
                      class="btn btn-pri !py-1.5 !px-3 !text-xs font-bold whitespace-nowrap"
                    >
                      🔊 Nghe US
                    </button>
                  </div>
                </div>
                ${
                  lesson.youtubeId
                    ? `<div class="text-[11px] text-mute flex items-center justify-between pt-1 border-t border-line/40">
                         <span>Bài này có sẵn Video hội thoại gốc:</span>
                         <button type="button" data-studio-media="video" class="text-pink-400 font-semibold hover:underline">Mở khung Video YouTube →</button>
                       </div>`
                    : ''
                }
              </div>
            `
            }

            <!-- Thanh Phụ đề / Gợi ý bài học + Tiến độ & Độ chính xác -->
            <div class="space-y-2 pt-1">
              <div class="flex items-center justify-between border-b border-line/60 pb-2 text-xs">
                <div class="flex items-center gap-4">
                  <button
                    type="button"
                    data-studio-left-tab="subtitles"
                    class="pb-1 font-bold transition ${
                      leftSubTab === 'subtitles'
                        ? 'text-pink-400 border-b-2 border-pink-400'
                        : 'text-mute hover:text-fg'
                    }"
                  >
                    ☰ Phụ đề (${segs.length})
                  </button>
                  <button
                    type="button"
                    data-studio-left-tab="guide"
                    class="pb-1 font-bold transition ${
                      leftSubTab === 'guide'
                        ? 'text-pink-400 border-b-2 border-pink-400'
                        : 'text-mute hover:text-fg'
                    }"
                  >
                    💡 Gợi ý bài học
                  </button>
                </div>
                <label class="flex items-center gap-1.5 text-[11px] text-mute cursor-pointer select-none">
                  <input type="checkbox" id="studio-loop-toggle" class="accent-pink-500" ${
                    loopSegment ? 'checked' : ''
                  }>
                  <span>Lặp lại câu</span>
                </label>
              </div>

              <!-- Dòng Tiến độ & Độ chính xác giống video Senglish -->
              <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div class="flex items-center gap-2">
                  <span class="font-mono tabular-nums font-bold text-fg">${stats.doneCount}/${
      segs.length
    }</span>
                  <div class="w-20 h-1.5 rounded-full bg-line overflow-hidden">
                    <div class="h-full bg-pink-500 transition-all" style="width:${progressPct}%"></div>
                  </div>
                  <span class="text-[11px] text-mute">Tiến độ</span>
                </div>
                <div class="flex items-center gap-3 text-[11px] text-mute">
                  <span>Độ chính xác: <b class="font-mono tabular-nums text-emerald-400">${
                    stats.avgPct !== null ? stats.avgPct + '%' : '--%'
                  }</b></span>
                  <label class="flex items-center gap-1 cursor-pointer select-none">
                    <input type="checkbox" id="studio-subs-toggle" class="accent-pink-500" ${
                      showLeftSubs ? 'checked' : ''
                    }>
                    <span>Hiện chữ</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Danh sách câu thoại #1, #2, #3... hoặc Gợi ý bài học -->
            ${
              leftSubTab === 'subtitles'
                ? `
              <div class="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                ${segs
                  .map((seg, idx) => {
                    const isCurrent =
                      idx === curSegIdx || (mergeNext && idx === curSegIdx + 1);
                    const segRec =
                      recordingStore[`${lesson.id}_${idx}_1`] ||
                      recordingStore[`${lesson.id}_${idx}_2`];
                    return `
                      <div
                        data-studio-seg="${idx}"
                        class="p-3 rounded-xl border transition cursor-pointer ${
                          isCurrent
                            ? 'border-pink-500/70 bg-pink-500/10 ring-1 ring-pink-500/40'
                            : 'border-line/60 bg-inset/40 hover:bg-inset/80'
                        }"
                      >
                        <div class="flex items-center justify-between gap-2 mb-1">
                          <div class="flex items-center gap-1.5">
                            <span class="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                              isCurrent
                                ? 'bg-pink-500 text-white'
                                : 'bg-line/60 text-mute'
                            }">#${idx + 1}</span>
                            <span class="text-[10px] font-mono text-mute">${seg.start || 0}s–${
                      seg.end || 6
                    }s</span>
                          </div>
                          ${
                            segRec
                              ? `<span class="text-[11px] font-mono tabular-nums font-bold ${
                                  segRec.pct >= 80
                                    ? 'text-emerald-400'
                                    : segRec.pct >= 55
                                    ? 'text-amber-300'
                                    : 'text-rose-400'
                                }">${segRec.pct}% ✓</span>`
                              : ''
                          }
                        </div>
                        <p class="text-xs sm:text-sm leading-relaxed ${
                          showLeftSubs ? 'text-fg font-medium' : 'blur-sm select-none text-mute'
                        }">
                          ${esc(seg.text)}
                        </p>
                      </div>
                    `;
                  })
                  .join('')}
              </div>
            `
                : `
              <div class="inset p-3.5 rounded-xl space-y-2.5 text-xs leading-relaxed">
                <div>
                  <b class="text-pink-400">💡 Ghi chú phát âm & Nối âm câu #${curSegIdx + 1}:</b>
                  <p class="text-fg mt-0.5">${esc(
                    ipaNote || 'Nghe kỹ trọng âm từ và âm cuối của từng cụm.'
                  )}</p>
                </div>
                <div class="pt-2 border-t border-line/50">
                  <b class="text-pri">🎯 Mẹo thi VSTEP Listening & Speaking:</b>
                  <p class="text-mute mt-0.5">
                    Hãy nghe câu mẫu bằng nút <b>🔊 Nghe US</b> trước, chạm vào từ mới bất kỳ trên câu để xem nghĩa và lưu vào Kho từ vựng, sau đó bấm <b>🎙️ Ghi âm</b> để kiểm tra độ khớp từng từ.
                  </p>
                </div>
              </div>
            `
            }
          </div>

          <!-- ================= CỘT PHẢI (7/12): KHÔNG GIAN THỰC HÀNH CÂU & CHẤM ĐIỂM ================= -->
          <div class="lg:col-span-7 space-y-4">
            <div class="card p-4 sm:p-5 space-y-4">
              
              <!-- Thanh điều khiển trên cùng của Cột Phải: #1 | 18 từ | Ghép câu kế tiếp (1/2) | IPA | Dịch nghĩa | Nghe US | Tách cụm -->
              <div class="flex flex-wrap items-center justify-between gap-2 border-b border-line/60 pb-3">
                <div class="flex flex-wrap items-center gap-1.5">
                  <span class="px-2.5 py-1 rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-300 font-mono text-xs font-bold">
                    #${curSegIdx + 1}${mergeNext && curSegIdx + 1 < segs.length ? '+' + (curSegIdx + 2) : ''}
                  </span>
                  <span class="px-2 py-1 rounded-lg bg-inset text-mute font-mono text-xs tabular-nums">
                    ${wordsArr.length} từ
                  </span>
                  ${
                    curSegIdx < segs.length - 1
                      ? `
                    <button
                      type="button"
                      id="studio-merge-next-btn"
                      class="px-2.5 py-1 rounded-lg border text-xs font-semibold transition whitespace-nowrap ${
                        mergeNext
                          ? 'border-pink-500/50 bg-pink-500/15 text-pink-300'
                          : 'border-line text-mute hover:text-fg'
                      }"
                      title="Gộp với câu tiếp theo để đọc liền hơi tự nhiên hơn (tối đa 2 câu)"
                    >
                      🔗 Ghép câu kế tiếp (${mergeNext ? '2/2' : '1/2'})
                    </button>
                  `
                      : ''
                  }
                </div>

                <div class="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    id="studio-toggle-ipa"
                    class="px-2.5 py-1 rounded-lg border text-xs font-semibold transition whitespace-nowrap ${
                      showIPA
                        ? 'border-pri/50 bg-pri/15 text-pri'
                        : 'border-line text-mute hover:text-fg'
                    }"
                  >
                    IPA
                  </button>
                  <button
                    type="button"
                    id="studio-toggle-trans"
                    class="px-2.5 py-1 rounded-lg border text-xs font-semibold transition whitespace-nowrap ${
                      showTrans
                        ? 'border-pri/50 bg-pri/15 text-pri'
                        : 'border-line text-mute hover:text-fg'
                    }"
                  >
                    Dịch nghĩa
                  </button>
                  <button
                    type="button"
                    id="studio-speak-us-btn"
                    class="px-3 py-1 rounded-lg border border-sky-500/40 bg-sky-500/10 text-sky-300 text-xs font-bold hover:bg-sky-500/20 whitespace-nowrap"
                    title="Nghe nguyên câu liền mạch chuẩn US"
                  >
                    🔊 Nghe US
                  </button>
                  <button
                    type="button"
                    id="studio-toggle-chunk-btn"
                    class="px-3 py-1 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-bold hover:bg-amber-500/20 whitespace-nowrap"
                    title="Ẩn/hiện khung Tách cụm (Đọc cả câu dừng 1.5s giữa các cụm hoặc chọn cụm để nghe)"
                  >
                    Tách cụm
                  </button>
                </div>
              </div>

              <!-- VÙNG HIỂN THỊ CÂU MẪU + PHIÊN ÂM IPA DƯỚI TỪNG TỪ (CHẠM TỪ ĐỂ TRA NGHĨA) -->
              <div class="inset p-4 rounded-2xl border border-line/80 space-y-3">
                <div class="flex flex-wrap items-end gap-x-1.5 gap-y-2 leading-relaxed ${
                  studioMode === 'dictation' && !showLeftSubs ? 'blur-md select-none' : ''
                }">
                  ${interactiveWordsHTML}
                </div>

                ${
                  showTrans
                    ? `
                  <div class="pt-2.5 border-t border-line/50 text-xs sm:text-sm text-emerald-400/90 font-medium">
                    🇻🇳 ${esc(combinedVi)}
                  </div>
                `
                    : ''
                }

                <div class="flex items-center justify-between text-[11px] text-mute pt-1">
                  <span>📖 Nhấn vào bất kỳ từ nào ở trên để tra nghĩa, nghe phát âm & lưu vào Kho từ vựng</span>
                </div>
              </div>

              <!-- THẺ TỪ ĐIỂN NỔI (POPOVER) KHI CHẠM VÀO TỪ -->
              ${wordPopoverHTML}

              <!-- KHUNG TÁCH CỤM (ẨN/HIỆN KHI BẤM NÚT "TÁCH CỤM" - GỒM 2 CHẾ ĐỘ) -->
              <div id="studio-chunk-box" class="hidden inset p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-2.5 text-xs">
                <div class="flex flex-wrap items-center justify-between gap-2 border-b border-line/50 pb-2">
                  <div class="flex items-center gap-2">
                    <b class="text-amber-400">Tách cụm theo nhịp thở (Chuẩn US)</b>
                    <span id="studio-chunk-status" class="font-mono text-[11px] text-mute"></span>
                  </div>
                  <div class="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      id="studio-chunk-play-all"
                      class="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold hover:bg-amber-500/30 whitespace-nowrap"
                    >
                      ▶ Đọc cả câu (Dừng 1.5s giữa các cụm)
                    </button>
                    <button
                      type="button"
                      id="studio-chunk-stop"
                      class="px-2 py-1 rounded-lg border border-line text-mute hover:text-fg whitespace-nowrap"
                    >
                      ⏹ Dừng
                    </button>
                  </div>
                </div>
                <div class="text-[11px] text-mute">
                  Chọn <b>▶ Đọc cả câu (Dừng 1.5s giữa các cụm)</b> hoặc bấm trực tiếp vào từng cụm bên dưới để nghe riêng cụm đó:
                </div>
                <div id="studio-chunk-list" class="flex flex-wrap items-center gap-2 pt-0.5"></div>
              </div>

              <!-- ================= NỘI DUNG TƯƠNG TÁC THEO CHẾ ĐỘ (SHADOWING | DICTATION | NGHE VSTEP) ================= -->
              ${
                studioMode === 'shadowing'
                  ? `
                <!-- CHẾ ĐỘ 1: SHADOWING & GHI ÂM CHẤM THẺ TỪ XANH / VÀNG / ĐỎ -->
                <div class="space-y-3.5 pt-1">
                  <!-- Khu vực Nút Bấm Ghi Âm Giọng Thật -->
                  <div id="studio-rec-panel" class="inset p-5 rounded-2xl border ${
                    isRecording
                      ? 'border-pink-500 bg-pink-500/10 ring-2 ring-pink-500/40'
                      : 'border-line/80'
                  } flex flex-col items-center justify-center text-center space-y-2.5">
                    <button
                      type="button"
                      id="studio-rec-toggle-btn"
                      class="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold transition shadow-lg cursor-pointer ${
                        isRecording
                          ? 'bg-rose-500 text-white hover:bg-rose-600'
                          : 'bg-pink-500/20 border-2 border-pink-500/50 text-pink-300 hover:bg-pink-500/30'
                      }"
                    >
                      ${isRecording ? '⏹' : '🎙️'}
                    </button>
                    <div>
                      <div id="studio-rec-label" class="text-sm font-bold text-fg">
                        ${
                          isRecording
                            ? `● Đang ghi âm... ${recordSeconds}s / 30s (Nhấn để dừng)`
                            : savedRec
                            ? 'Thử lại — Nhấn để ghi âm lại phát âm'
                            : 'Nhấn để bắt đầu ghi âm'
                        }
                      </div>
                      <div class="text-xs text-mute mt-0.5">
                        (Tối đa 30 giây · Hệ thống sẽ thu lại giọng bạn và chấm từng từ Xanh / Vàng / Đỏ)
                      </div>
                    </div>
                    <div id="studio-live-transcript" class="text-xs font-mono text-pink-300 min-h-[18px]">
                      ${isRecording && liveTranscript ? esc(liveTranscript) : ''}
                    </div>
                  </div>

                  <!-- Ô nhập nhanh bằng Mic bàn phím iPad (Dự phòng tiện lợi khi không muốn bật quyền Micro trình duyệt) -->
                  <div class="flex items-center gap-2">
                    <input
                      id="studio-manual-speech-in"
                      type="text"
                      class="inp !py-2 !text-xs"
                      placeholder="Hoặc đặt trỏ chuột vào đây rồi bấm Mic 🎙️ trên bàn phím iPad để đọc..."
                      value="${savedRec ? esc(savedRec.transcript) : ''}"
                    />
                    <button
                      type="button"
                      id="studio-eval-manual-btn"
                      class="btn !py-2 !px-3 !text-xs font-bold whitespace-nowrap"
                    >
                      Chấm câu vừa đọc
                    </button>
                  </div>

                  <!-- Kết quả Ghi âm: Thanh nghe lại giọng của chính mình + Thẻ từ Xanh/Vàng/Đỏ + Nút AI Nhận xét -->
                  <div class="inset p-4 rounded-2xl border border-line/70 space-y-3">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                      <span class="text-xs font-bold text-mute">
                        ${
                          savedRec
                            ? `${savedRec.correctCount}/${savedRec.total} từ đúng (${savedRec.pct}%)`
                            : 'Nghe và lặp lại câu trên:'
                        }
                      </span>
                      ${
                        savedRec
                          ? `<span class="text-[11px] text-mute">Bấm vào từng thẻ từ bên dưới để nghe lại từ đó</span>`
                          : ''
                      }
                    </div>

                    ${
                      savedRec
                        ? `
                      <div class="p-3 rounded-xl bg-card/70 border border-line/60 space-y-2">
                        <div class="text-xs">
                          <span class="text-mute">Bạn đã nói:</span>
                          <p class="font-medium text-fg mt-0.5">"${esc(savedRec.transcript)}"</p>
                        </div>
                        ${
                          savedRec.audioUrl
                            ? `
                          <div class="pt-1">
                            <div class="text-[11px] text-pink-400 font-semibold mb-1">🎧 Nghe lại giọng thu âm của bạn:</div>
                            <audio controls src="${esc(
                              savedRec.audioUrl
                            )}" class="w-full h-9 rounded-lg"></audio>
                          </div>
                        `
                            : ''
                        }
                      </div>
                    `
                        : ''
                    }

                    <!-- Danh sách ô [ •••• ] hoặc Thẻ từ Xanh ✓ / Vàng ▲ / Đỏ ✗ -->
                    <div class="flex flex-wrap items-center gap-2 pt-1">
                      ${wordSlotsHTML}
                    </div>

                    ${
                      savedRec
                        ? `
                      <div class="pt-2 flex flex-wrap items-center justify-center gap-2">
                        <button
                          type="button"
                          id="studio-open-ai-coach-btn"
                          class="px-4 py-2 rounded-xl bg-pink-500/20 border border-pink-500/50 text-pink-300 text-xs font-bold hover:bg-pink-500/30 transition cursor-pointer"
                        >
                          ✨ Nhờ AI nhận xét phát âm chi tiết
                        </button>
                      </div>
                    `
                        : ''
                    }
                  </div>

                  <!-- KHUNG AI HUẤN LUYỆN PHÁT ÂM (4 MỤC NHƯ VIDEO SENGLISH) -->
                  <div
                    id="studio-ai-coach-box"
                    class="${
                      savedRec && savedRec.showCoach ? '' : 'hidden'
                    } inset p-4 rounded-2xl border border-pink-500/40 bg-pink-500/5 space-y-3"
                  >
                    <div class="flex items-center justify-between border-b border-line/60 pb-2">
                      <div class="flex items-center gap-2">
                        <span class="text-base">🤖</span>
                        <b class="text-sm text-pink-300">AI Huấn luyện phát âm</b>
                      </div>
                      <button type="button" id="studio-close-ai-coach" class="text-xs text-mute hover:text-fg px-2 py-0.5 rounded border border-line">Đóng</button>
                    </div>
                    <div id="studio-ai-coach-content">
                      ${savedRec && savedRec.aiCoachHtml ? savedRec.aiCoachHtml : ''}
                    </div>
                  </div>
                </div>
              `
                  : studioMode === 'dictation'
                  ? `
                <!-- CHẾ ĐỘ 2: DICTATION (NGHE CHÉP CHÍNH TẢ TỪNG CÂU) -->
                <div class="inset p-4 rounded-2xl border border-line/80 space-y-3">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <b class="text-xs text-pri uppercase">⌨️ Nghe Chép Chính Tả Câu #${
                      curSegIdx + 1
                    }</b>
                    <div class="flex items-center gap-1.5">
                      <button type="button" id="studio-dict-hint-btn" class="btn !py-1 !px-2.5 !text-xs">💡 Gợi ý từ tiếp theo</button>
                      <button type="button" id="studio-dict-reveal-btn" class="btn !py-1 !px-2.5 !text-xs">👁️ Hiện/Ẩn câu mẫu</button>
                    </div>
                  </div>
                  <textarea
                    id="studio-dict-input"
                    rows="2"
                    class="inp text-sm font-mono"
                    placeholder="Bấm '🔊 Nghe US' hoặc 'Tách cụm' rồi gõ lại chính xác những gì bạn nghe được..."
                  >${esc(savedDictation)}</textarea>
                  <div id="studio-dict-feedback" class="text-xs leading-relaxed">
                    ${
                      dictResult
                        ? `
                      <div class="space-y-1.5">
                        <div class="font-mono font-bold ${
                          dictResult.pct >= 85 ? 'text-emerald-400' : 'text-amber-300'
                        }">
                          Độ khớp chính tả: ${dictResult.correctCount}/${dictResult.total} từ (${
                            dictResult.pct
                          }%)
                        </div>
                        <div class="flex flex-wrap gap-1">${dictResult.html}</div>
                      </div>
                    `
                        : '<span class="text-mute">Gõ câu bạn nghe được vào ô trên để hệ thống kiểm tra từng từ thời gian thực.</span>'
                    }
                  </div>
                </div>
              `
                  : `
                <!-- CHẾ ĐỘ 3: NGHE HIỂU & GIẢI BẪY ĐỀ THI VSTEP + PHẢN XẠ SPEAKING -->
                <div class="space-y-3">
                  ${
                    lesson.mcq
                      ? `
                    <div class="inset p-4 rounded-2xl border border-line/80 space-y-3">
                      <div class="flex items-center justify-between gap-2">
                        <b class="text-xs text-warn uppercase">🎧 Câu hỏi Nghe hiểu VSTEP (${lv})</b>
                        <span class="text-[11px] text-mute">Bấm chọn đáp án đúng</span>
                      </div>
                      <p class="text-sm font-semibold text-fg">${esc(lesson.mcq.question)}</p>
                      <div class="space-y-2">
                        ${lesson.mcq.options
                          .map(
                            (opt, oIdx) => `
                          <button
                            type="button"
                            data-studio-mcq="${oIdx}"
                            class="w-full text-left p-3 rounded-xl border border-line/70 hover:border-pri text-xs sm:text-sm transition flex items-start gap-2"
                          >
                            <b class="font-mono text-pri">${String.fromCharCode(65 + oIdx)}.</b>
                            <span>${esc(opt)}</span>
                          </button>
                        `
                          )
                          .join('')}
                      </div>
                      <div id="studio-mcq-explain" class="hidden p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-xs space-y-1"></div>
                    </div>
                  `
                      : ''
                  }

                  ${
                    lesson.speakingPrompt
                      ? `
                    <div class="inset p-4 rounded-2xl border border-pri/30 bg-pri/5 space-y-2 text-xs">
                      <b class="text-pri uppercase">🗣️ Câu hỏi Mở rộng VSTEP Speaking cùng chủ đề:</b>
                      <p class="text-sm font-bold text-fg">${esc(lesson.speakingPrompt.question)}</p>
                      <p class="text-mute">${esc(lesson.speakingPrompt.hintVi)}</p>
                    </div>
                  `
                      : ''
                  }
                </div>
              `
              }

              <!-- THANH ĐIỀU KHIỂN ĐÁY: CHỈNH TỐC ĐỘ (0.5x - 1.5x) & CHUYỂN CÂU (GIỐNG ĐÁY VIDEO SENGLISH) -->
              <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-line/60">
                <div class="flex flex-wrap items-center gap-1">
                  <button
                    type="button"
                    id="studio-bottom-play-btn"
                    class="w-9 h-9 rounded-xl bg-pink-500 text-white font-bold flex items-center justify-center hover:bg-pink-600 transition cursor-pointer mr-1"
                    title="Phát câu hiện tại (US)"
                  >
                    ▶
                  </button>
                  ${[0.5, 0.75, 1, 1.25, 1.5]
                    .map(
                      (spd) => `
                    <button
                      type="button"
                      data-studio-speed="${spd}"
                      class="px-2.5 py-1.5 rounded-lg font-mono text-xs font-bold transition cursor-pointer ${
                        playbackSpeed === spd
                          ? 'bg-pink-500/25 border border-pink-500/50 text-pink-300'
                          : 'bg-inset text-mute hover:text-fg'
                      }"
                    >
                      ${spd}x
                    </button>
                  `
                    )
                    .join('')}
                </div>

                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    id="studio-prev-seg-btn"
                    class="btn !py-1.5 !px-3 !text-xs whitespace-nowrap"
                    ${curSegIdx === 0 ? 'disabled' : ''}
                  >
                    ← Câu trước
                  </button>
                  <button
                    type="button"
                    id="studio-next-seg-btn"
                    class="px-4 py-1.5 rounded-xl bg-pink-500 text-white text-xs font-bold hover:bg-pink-600 transition whitespace-nowrap cursor-pointer"
                  >
                    ${curSegIdx < segs.length - 1 ? 'Tiếp theo →' : 'Hoàn thành bài ✓'}
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

        <!-- MODAL THÊM BÀI HỌC MỚI TỪ YOUTUBE / ELLLO.ORG / VĂN BẢN -->
        <div id="studio-import-modal" class="hidden fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div class="card max-w-lg w-full p-5 space-y-3.5 max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between border-b border-line pb-2.5">
              <b class="text-base">➕ Thêm bài luyện từ YouTube / ELLLO.org</b>
              <button type="button" id="studio-close-import-modal" class="btn !py-1 !px-2.5 !text-xs">Đóng</button>
            </div>
            <div class="space-y-2.5 text-xs">
              <div>
                <label class="font-bold text-mute block mb-1">Tiêu đề bài học:</label>
                <input id="imp-title" type="text" class="inp text-xs" placeholder="VD: ELLLO #388 Daily Routine / Hội thoại Khám tim mạch..." />
              </div>
              <div>
                <label class="font-bold text-mute block mb-1">Link hoặc ID Video YouTube (Tùy chọn):</label>
                <input id="imp-yt" type="text" class="inp text-xs font-mono" placeholder="VD: https://www.youtube.com/watch?v=zN6V2M3bE8M" />
              </div>
              <div>
                <label class="font-bold text-mute block mb-1">Nội dung các câu tiếng Anh (Mỗi câu 1 dòng hoặc đoạn văn bất kỳ):</label>
                <textarea id="imp-script" rows="5" class="inp text-xs font-mono" placeholder="Easy English conversations.&#10;How often do you go swimming?&#10;I usually go swimming twice a week."></textarea>
              </div>
              <div>
                <label class="font-bold text-mute block mb-1">Bản dịch tiếng Việt tương ứng (Tùy chọn, mỗi câu 1 dòng):</label>
                <textarea id="imp-vi" rows="3" class="inp text-xs" placeholder="Hội thoại tiếng Anh dễ hiểu.&#10;Bạn có thường đi bơi không?"></textarea>
              </div>
            </div>
            <div class="flex justify-end gap-2 pt-2 border-t border-line">
              <button type="button" id="studio-save-import-btn" class="btn btn-pri font-bold !text-xs">Lưu & Bắt đầu luyện tập</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function stopActiveRecording() {
    isRecording = false;
    if (recordTimerId) {
      clearInterval(recordTimerId);
      recordTimerId = null;
    }
    if (speechRec) {
      try {
        speechRec.onend = null;
        speechRec.stop();
      } catch (e) {}
      speechRec = null;
    }
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      try {
        mediaRecorder.stop();
      } catch (e) {}
    }
  }

  function bind(container, lv, state) {
    const esc = global.LexiAcademy.esc;
    const ctx = getActiveLessonAndSegment(lv);
    const { list, lesson, segs, combinedText, recKey } = ctx;

    // 1. Chọn bài học
    const lessonSelect = container.querySelector('#studio-lesson-select');
    if (lessonSelect) {
      lessonSelect.onchange = () => {
        stopActiveRecording();
        curLessonIdx = Number(lessonSelect.value) || 0;
        curSegIdx = 0;
        mergeNext = false;
        activePopoverWord = null;
        global.LexiAcademy.render();
      };
    }

    // 2. Chuyển đổi 3 chế độ (Shadowing | Dictation | Nghe VSTEP)
    container.querySelectorAll('[data-studio-mode]').forEach((btn) => {
      btn.onclick = () => {
        stopActiveRecording();
        studioMode = btn.getAttribute('data-studio-mode') || 'shadowing';
        global.LexiAcademy.render();
      };
    });

    // 3. Chuyển đổi Video / Âm thanh ở cột trái
    container.querySelectorAll('[data-studio-media]').forEach((btn) => {
      btn.onclick = () => {
        mediaTab = btn.getAttribute('data-studio-media') || 'audio';
        global.LexiAcademy.render();
      };
    });

    // 4. Chuyển tab Phụ đề / Gợi ý bài học ở cột trái
    container.querySelectorAll('[data-studio-left-tab]').forEach((btn) => {
      btn.onclick = () => {
        leftSubTab = btn.getAttribute('data-studio-left-tab') || 'subtitles';
        global.LexiAcademy.render();
      };
    });

    // 5. Công tắc Lặp lại câu & Hiện chữ
    const loopToggle = container.querySelector('#studio-loop-toggle');
    if (loopToggle) {
      loopToggle.onchange = () => {
        loopSegment = !!loopToggle.checked;
      };
    }
    const subsToggle = container.querySelector('#studio-subs-toggle');
    if (subsToggle) {
      subsToggle.onchange = () => {
        showLeftSubs = !!subsToggle.checked;
        global.LexiAcademy.render();
      };
    }

    // 6. Bấm chọn câu #1, #2, #3... ở cột trái
    container.querySelectorAll('[data-studio-seg]').forEach((card) => {
      card.onclick = () => {
        stopActiveRecording();
        curSegIdx = Number(card.getAttribute('data-studio-seg')) || 0;
        activePopoverWord = null;
        global.LexiAcademy.render();
        const nextCtx = getActiveLessonAndSegment(lv);
        if (typeof global.speakUS === 'function') {
          global.speakUS(nextCtx.combinedText);
        }
      };
    });

    // 7. Nút Đi đến câu đầu & Phát câu hiện tại
    const jumpFirstBtn = container.querySelector('#studio-jump-first-btn');
    if (jumpFirstBtn) {
      jumpFirstBtn.onclick = () => {
        stopActiveRecording();
        curSegIdx = 0;
        activePopoverWord = null;
        global.LexiAcademy.render();
        const firstCtx = getActiveLessonAndSegment(lv);
        if (typeof global.speakUS === 'function') {
          global.speakUS(firstCtx.combinedText);
        }
      };
    }

    const playCurrentSentenceUS = () => {
      if (typeof global.setAudioPlaybackRate === 'function') {
        global.setAudioPlaybackRate(playbackSpeed);
      }
      if (typeof global.speakUS === 'function') {
        global.speakUS(combinedText, {
          onComplete: () => {
            if (loopSegment) {
              setTimeout(() => {
                if (loopSegment) playCurrentSentenceUS();
              }, 700);
            }
          }
        });
      }
    };

    const leftPlayUsBtn = container.querySelector('#studio-left-play-us');
    if (leftPlayUsBtn) leftPlayUsBtn.onclick = playCurrentSentenceUS;

    const speakUsBtn = container.querySelector('#studio-speak-us-btn');
    if (speakUsBtn) speakUsBtn.onclick = playCurrentSentenceUS;

    const bottomPlayBtn = container.querySelector('#studio-bottom-play-btn');
    if (bottomPlayBtn) bottomPlayBtn.onclick = playCurrentSentenceUS;

    const playYtSegBtn = container.querySelector('#studio-play-yt-seg-btn');
    if (playYtSegBtn) {
      playYtSegBtn.onclick = () => {
        const iframe = container.querySelector('#studio-yt-iframe');
        if (iframe && lesson.youtubeId) {
          iframe.src = `https://www.youtube.com/embed/${lesson.youtubeId}?start=${ctx.startSec}&end=${ctx.endSec}&autoplay=1&playsinline=1&rel=0`;
        }
      };
    }

    // 8. Nút Ghép câu kế tiếp (1/2 -> 2/2), IPA, Dịch nghĩa
    const mergeNextBtn = container.querySelector('#studio-merge-next-btn');
    if (mergeNextBtn) {
      mergeNextBtn.onclick = () => {
        stopActiveRecording();
        mergeNext = !mergeNext;
        activePopoverWord = null;
        global.LexiAcademy.render();
      };
    }

    const toggleIpaBtn = container.querySelector('#studio-toggle-ipa');
    if (toggleIpaBtn) {
      toggleIpaBtn.onclick = () => {
        showIPA = !showIPA;
        global.LexiAcademy.render();
      };
    }

    const toggleTransBtn = container.querySelector('#studio-toggle-trans');
    if (toggleTransBtn) {
      toggleTransBtn.onclick = () => {
        showTrans = !showTrans;
        global.LexiAcademy.render();
      };
    }

    // 9. Chạm vào từng từ trên câu để mở Thẻ Từ Điển Nổi (Popover) + Phát âm từ đó + Lưu Kho từ
    container.querySelectorAll('[data-studio-word]').forEach((wBtn) => {
      wBtn.onclick = () => {
        const rawW = wBtn.getAttribute('data-studio-word') || '';
        const wIdx = Number(wBtn.getAttribute('data-studio-word-idx'));
        const cleanW = cleanWordToken(rawW);
        if (cleanW && typeof global.playSingleChunkUS === 'function') {
          global.playSingleChunkUS(cleanW);
        }
        if (activePopoverWord && activePopoverWord.idx === wIdx) {
          activePopoverWord = null;
        } else {
          activePopoverWord = { word: cleanW || rawW, idx: wIdx };
        }
        global.LexiAcademy.render();
      };
    });

    const popCloseBtn = container.querySelector('#studio-pop-close');
    if (popCloseBtn) {
      popCloseBtn.onclick = () => {
        activePopoverWord = null;
        global.LexiAcademy.render();
      };
    }

    container.querySelectorAll('[data-pop-speak]').forEach((b) => {
      b.onclick = () => {
        const w = b.getAttribute('data-pop-speak');
        if (w && typeof global.playSingleChunkUS === 'function') {
          global.playSingleChunkUS(w);
        }
      };
    });

    const popSaveWordBtn = container.querySelector('#studio-pop-save-word');
    if (popSaveWordBtn) {
      popSaveWordBtn.onclick = () => {
        global.LexiAcademy.quickAddWord(
          {
            word: popSaveWordBtn.getAttribute('data-word'),
            ipa: popSaveWordBtn.getAttribute('data-ipa'),
            pos: popSaveWordBtn.getAttribute('data-pos'),
            meaning: popSaveWordBtn.getAttribute('data-meaning'),
            example: popSaveWordBtn.getAttribute('data-ex'),
            exampleTrans: popSaveWordBtn.getAttribute('data-extrans'),
            cefr: lv,
            topic: lesson.category
          },
          popSaveWordBtn
        );
      };
    }

    // 10. Nút "Tách cụm" (Ẩn/hiện khung 2 chế độ: Đọc cả câu dừng 1.5s giữa các cụm hoặc chọn cụm để nghe)
    const toggleChunkBtn = container.querySelector('#studio-toggle-chunk-btn');
    const chunkBox = container.querySelector('#studio-chunk-box');
    const chunkListEl = container.querySelector('#studio-chunk-list');
    const chunkStatusEl = container.querySelector('#studio-chunk-status');
    const chunkPlayAllBtn = container.querySelector('#studio-chunk-play-all');
    const chunkStopBtn = container.querySelector('#studio-chunk-stop');

    const resetChunkHighlight = () => {
      if (!chunkListEl) return;
      chunkListEl.querySelectorAll('[data-studio-chunk-idx]').forEach((b) => {
        b.className =
          'px-2.5 py-1.5 rounded-lg border border-line bg-inset/80 text-fg hover:border-amber-400/60 transition font-mono text-xs text-left';
      });
    };

    const renderChunks = () => {
      if (!chunkListEl) return [];
      const chunks =
        typeof global.splitIntoBreathChunks === 'function'
          ? global.splitIntoBreathChunks(combinedText)
          : [combinedText];
      chunkListEl.innerHTML = chunks
        .map(
          (c, i) => `
          <button type="button" data-studio-chunk-idx="${i}" class="px-2.5 py-1.5 rounded-lg border border-line bg-inset/80 text-fg hover:border-amber-400/60 transition font-mono text-xs text-left">
            <span class="text-amber-400 font-bold mr-1">${i + 1}.</span>${esc(c)}
          </button>
          ${i < chunks.length - 1 ? '<span class="text-mute font-mono text-xs">➔</span>' : ''}
        `
        )
        .join('');

      chunkListEl.querySelectorAll('[data-studio-chunk-idx]').forEach((b) => {
        b.onclick = () => {
          const idx = Number(b.getAttribute('data-studio-chunk-idx'));
          const cTxt = chunks[idx];
          if (!cTxt) return;
          resetChunkHighlight();
          b.className =
            'px-2.5 py-1.5 rounded-lg border border-sky-400 bg-sky-500/20 text-sky-200 ring-2 ring-sky-400/60 transition font-mono text-xs text-left font-bold';
          if (chunkStatusEl) {
            chunkStatusEl.textContent = `🔊 Đang đọc cụm ${idx + 1}/${chunks.length} (US)...`;
          }
          if (typeof global.playSingleChunkUS === 'function') {
            global.playSingleChunkUS(cTxt, {
              onComplete: () => {
                resetChunkHighlight();
                if (chunkStatusEl) {
                  chunkStatusEl.textContent = `✓ Đã đọc cụm ${idx + 1}/${chunks.length}`;
                }
              }
            });
          }
        };
      });
      return chunks;
    };

    if (toggleChunkBtn && chunkBox) {
      toggleChunkBtn.onclick = () => {
        const isHidden = chunkBox.classList.contains('hidden');
        if (!isHidden) {
          chunkBox.classList.add('hidden');
          toggleChunkBtn.textContent = 'Tách cụm';
          if (typeof global.stopAudioPlayback === 'function') global.stopAudioPlayback();
          resetChunkHighlight();
          return;
        }
        chunkBox.classList.remove('hidden');
        toggleChunkBtn.textContent = 'Ẩn tách cụm';
        renderChunks();
      };
    }

    if (chunkPlayAllBtn) {
      chunkPlayAllBtn.onclick = () => {
        renderChunks();
        if (typeof global.speakShadow === 'function') {
          global.speakShadow(combinedText, {
            onChunkStart: (idx, total) => {
              resetChunkHighlight();
              const activeB = chunkListEl?.querySelector(`[data-studio-chunk-idx="${idx}"]`);
              if (activeB) {
                activeB.className =
                  'px-2.5 py-1.5 rounded-lg border border-sky-400 bg-sky-500/25 text-sky-200 ring-2 ring-sky-400/70 transition font-mono text-xs text-left font-bold';
              }
              if (chunkStatusEl) {
                chunkStatusEl.textContent = `🔊 Đang đọc cụm ${idx + 1}/${total} (US)...`;
              }
            },
            onPauseStart: (idx, total) => {
              resetChunkHighlight();
              const activeB = chunkListEl?.querySelector(`[data-studio-chunk-idx="${idx}"]`);
              if (activeB) {
                activeB.className =
                  'px-2.5 py-1.5 rounded-lg border border-emerald-400 bg-emerald-500/25 text-emerald-200 ring-2 ring-emerald-400/70 transition font-mono text-xs text-left font-bold';
              }
              if (chunkStatusEl) {
                chunkStatusEl.textContent = `🎙️ Dừng 1.5s — Hãy nhại lại cụm ${idx + 1}/${total}...`;
              }
            },
            onComplete: () => {
              resetChunkHighlight();
              if (chunkStatusEl) {
                chunkStatusEl.textContent = '✓ Hoàn tất đọc cả câu (dừng 1.5s giữa các cụm)';
              }
            }
          });
        }
      };
    }

    if (chunkStopBtn) {
      chunkStopBtn.onclick = () => {
        if (typeof global.stopAudioPlayback === 'function') global.stopAudioPlayback();
        resetChunkHighlight();
        if (chunkStatusEl) chunkStatusEl.textContent = '⏹ Đã dừng.';
      };
    }

    // 11. Ghi âm Giọng đọc thật (MediaRecorder + SpeechRecognition) & Chấm thẻ từ Xanh/Vàng/Đỏ
    const finalizeSpokenEvaluation = (spokenTranscript, audioBlobUrl) => {
      const cleanSpoken = String(spokenTranscript || '').trim();
      if (!cleanSpoken && !audioBlobUrl) {
        global.LexiAcademy.notify(
          'Chưa nhận diện được giọng nói. Bạn có thể nói rõ hơn hoặc dùng Mic 🎙️ trên bàn phím iPad ở ô bên dưới nhé!'
        );
        global.LexiAcademy.render();
        return;
      }

      const evalRes = evaluateSpokenWords(combinedText, cleanSpoken);
      const coachHtml = buildAICoachFeedbackHTML(combinedText, cleanSpoken, evalRes, esc);

      recordingStore[recKey] = {
        transcript: cleanSpoken || '(Đã thu âm giọng nói)',
        audioUrl: audioBlobUrl || (recordingStore[recKey] && recordingStore[recKey].audioUrl) || '',
        wordResults: evalRes.wordResults,
        correctCount: evalRes.correctCount,
        nearCount: evalRes.nearCount,
        total: evalRes.total,
        pct: evalRes.pct,
        aiCoachHtml: coachHtml,
        showCoach: false
      };

      if (evalRes.pct >= 60) {
        const allDone = segs.every(
          (_, sIdx) =>
            recordingStore[`${lesson.id}_${sIdx}_1`] ||
            recordingStore[`${lesson.id}_${sIdx}_2`]
        );
        if (allDone) global.LexiAcademy.markDone(lesson.id);
      }

      global.LexiAcademy.render();
    };

    const recToggleBtn = container.querySelector('#studio-rec-toggle-btn');
    if (recToggleBtn) {
      recToggleBtn.onclick = async () => {
        if (isRecording) {
          stopActiveRecording();
          return;
        }

        if (typeof global.stopAudioPlayback === 'function') {
          global.stopAudioPlayback();
        }

        liveTranscript = '';
        recordSeconds = 0;
        recordedChunks = [];
        let createdAudioUrl = '';

        // 1. Khởi tạo MediaRecorder để thu lại giọng thật của người học phát lại được
        let stream = null;
        if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
          try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (typeof MediaRecorder !== 'undefined') {
              mediaRecorder = new MediaRecorder(stream);
              mediaRecorder.ondataavailable = (ev) => {
                if (ev.data && ev.data.size > 0) recordedChunks.push(ev.data);
              };
              mediaRecorder.onstop = () => {
                if (recordedChunks.length > 0) {
                  const blob = new Blob(recordedChunks, {
                    type: mediaRecorder.mimeType || 'audio/mp4'
                  });
                  createdAudioUrl = URL.createObjectURL(blob);
                }
                if (stream) {
                  stream.getTracks().forEach((t) => t.stop());
                }
                finalizeSpokenEvaluation(liveTranscript, createdAudioUrl);
              };
              mediaRecorder.start();
            }
          } catch (err) {
            // Tiếp tục với SpeechRecognition nếu người dùng chưa cấp quyền MediaRecorder
          }
        }

        // 2. Khởi tạo SpeechRecognition nhận diện từng từ tiếng Anh
        const SR = global.SpeechRecognition || global.webkitSpeechRecognition;
        if (SR) {
          try {
            speechRec = new SR();
            speechRec.lang = 'en-US';
            speechRec.continuous = true;
            speechRec.interimResults = true;
            speechRec.onresult = (event) => {
              let transcript = '';
              for (let i = 0; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript + ' ';
              }
              liveTranscript = transcript.trim();
              const liveEl = container.querySelector('#studio-live-transcript');
              if (liveEl) liveEl.textContent = liveTranscript;
              const manualInp = container.querySelector('#studio-manual-speech-in');
              if (manualInp && liveTranscript) manualInp.value = liveTranscript;
            };
            speechRec.onerror = () => {};
            speechRec.onend = () => {
              if (isRecording && (!mediaRecorder || mediaRecorder.state === 'inactive')) {
                stopActiveRecording();
                finalizeSpokenEvaluation(liveTranscript, createdAudioUrl);
              }
            };
            speechRec.start();
          } catch (e) {}
        }

        isRecording = true;
        global.LexiAcademy.render();

        recordTimerId = setInterval(() => {
          recordSeconds++;
          const lbl = document.getElementById('studio-rec-label');
          if (lbl) {
            lbl.textContent = `● Đang ghi âm... ${recordSeconds}s / 30s (Nhấn để dừng)`;
          }
          if (recordSeconds >= 30) {
            stopActiveRecording();
            if (!mediaRecorder || mediaRecorder.state === 'inactive') {
              finalizeSpokenEvaluation(liveTranscript, createdAudioUrl);
            }
          }
        }, 1000);
      };
    }

    // Chấm câu từ ô nhập / Mic bàn phím iPad
    const manualSpeechIn = container.querySelector('#studio-manual-speech-in');
    const evalManualBtn = container.querySelector('#studio-eval-manual-btn');
    if (evalManualBtn && manualSpeechIn) {
      evalManualBtn.onclick = () => {
        const val = manualSpeechIn.value.trim();
        if (!val) {
          global.LexiAcademy.notify('Hãy đọc bằng Mic bàn phím hoặc nhập câu vào ô trước khi chấm.');
          manualSpeechIn.focus();
          return;
        }
        finalizeSpokenEvaluation(val, '');
      };
    }

    // Bấm vào từng thẻ từ Xanh ✓ / Vàng ▲ / Đỏ ✗ để nghe lại cách phát âm chuẩn của từ đó
    container.querySelectorAll('[data-chip-speak]').forEach((chip) => {
      chip.onclick = () => {
        const w = chip.getAttribute('data-chip-speak');
        if (w && typeof global.playSingleChunkUS === 'function') {
          global.playSingleChunkUS(w);
        }
      };
    });

    // Mở / Đóng khung AI Huấn luyện phát âm
    const openAiCoachBtn = container.querySelector('#studio-open-ai-coach-btn');
    const closeAiCoachBtn = container.querySelector('#studio-close-ai-coach');
    const aiCoachBox = container.querySelector('#studio-ai-coach-box');

    if (openAiCoachBtn && aiCoachBox) {
      openAiCoachBtn.onclick = async () => {
        const curRec = recordingStore[recKey];
        if (!curRec) return;
        curRec.showCoach = true;
        aiCoachBox.classList.remove('hidden');

        // Nếu có kết nối AI trực tuyến, bổ sung thêm lời khuyên phát âm chuyên sâu
        const aiFn =
          typeof global.ai === 'function'
            ? global.ai
            : typeof global.rawAi === 'function'
            ? global.rawAi
            : null;
        const extraSlot = container.querySelector('#studio-ai-extra-slot');
        if (aiFn && extraSlot && !curRec.aiEnriched) {
          curRec.aiEnriched = true;
          try {
            const prompt = `Bạn là Huấn luyện viên phát âm tiếng Anh Mỹ (US Pronunciation Coach).
- Câu mẫu chuẩn: "${combinedText}"
- Học viên vừa đọc: "${curRec.transcript}" (Độ khớp: ${curRec.pct}%)
Hãy chỉ ra ngắn gọn trong 2-3 gạch đầu dòng:
1. Từ nào học viên đọc nhầm hoặc nuốt âm cuối và cách đặt khẩu hình miệng/lưỡi (IPA) để sửa.
2. Cách nối âm (linking sounds) tự nhiên nhất trong câu này.`;
            const res = await Promise.race([
              aiFn(prompt, undefined, true),
              new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 6000))
            ]);
            if (res && String(res).trim()) {
              extraSlot.classList.remove('hidden');
              extraSlot.innerHTML = `<b class="text-pink-400">💡 Phân tích khẩu hình & nối âm chuyên sâu từ AI:</b><div class="mt-1 leading-relaxed">${esc(
                String(res).trim()
              )
                .replace(/\*\*(.+?)\*\*/g, '<b class="text-fg">$1</b>')
                .replace(/\n/g, '<br>')}</div>`;
            }
          } catch (e) {}
        }
      };
    }

    if (closeAiCoachBtn && aiCoachBox) {
      closeAiCoachBtn.onclick = () => {
        const curRec = recordingStore[recKey];
        if (curRec) curRec.showCoach = false;
        aiCoachBox.classList.add('hidden');
      };
    }

    // 12. Chế độ Dictation (Chép chính tả)
    const dictInput = container.querySelector('#studio-dict-input');
    const dictFeedback = container.querySelector('#studio-dict-feedback');
    const dictHintBtn = container.querySelector('#studio-dict-hint-btn');
    const dictRevealBtn = container.querySelector('#studio-dict-reveal-btn');

    if (dictInput && dictFeedback) {
      dictInput.oninput = () => {
        const val = dictInput.value;
        const draftKey = `lis_dict_${lesson.id}_${curSegIdx}`;
        if (state && state.drafts) {
          state.drafts[draftKey] = val;
          global.LexiAcademy.saveState();
        }
        const cmp = global.LexiAcademy.compareTokens(combinedText, val);
        dictFeedback.innerHTML = `
          <div class="space-y-1.5">
            <div class="font-mono font-bold ${
              cmp.pct >= 85 ? 'text-emerald-400' : 'text-amber-300'
            }">
              Độ khớp chính tả: ${cmp.correctCount}/${cmp.total} từ (${cmp.pct}%)
            </div>
            <div class="flex flex-wrap gap-1">${cmp.html}</div>
          </div>
        `;
      };
    }

    if (dictHintBtn && dictInput) {
      dictHintBtn.onclick = () => {
        const targetWords = combinedText.split(/\s+/).filter(Boolean);
        const typedWords = dictInput.value.trim().split(/\s+/).filter(Boolean);
        const nextWord = targetWords[Math.min(typedWords.length, targetWords.length - 1)];
        if (nextWord) {
          dictInput.value = (dictInput.value.trim() + ' ' + nextWord).trim() + ' ';
          dictInput.dispatchEvent(new Event('input'));
          dictInput.focus();
        }
      };
    }

    if (dictRevealBtn) {
      dictRevealBtn.onclick = () => {
        showLeftSubs = !showLeftSubs;
        global.LexiAcademy.render();
      };
    }

    // 13. Chế độ Nghe VSTEP (MCQ)
    const mcqExplain = container.querySelector('#studio-mcq-explain');
    container.querySelectorAll('[data-studio-mcq]').forEach((btn) => {
      btn.onclick = () => {
        if (!lesson.mcq) return;
        const picked = Number(btn.getAttribute('data-studio-mcq'));
        const isCorrect = picked === lesson.mcq.answer;

        container.querySelectorAll('[data-studio-mcq]').forEach((b, idx) => {
          b.classList.remove('border-emerald-500', 'bg-emerald-500/15', 'border-rose-500', 'bg-rose-500/15');
          if (idx === lesson.mcq.answer) {
            b.classList.add('border-emerald-500', 'bg-emerald-500/15');
          } else if (idx === picked && !isCorrect) {
            b.classList.add('border-rose-500', 'bg-rose-500/15');
          }
        });

        if (mcqExplain) {
          mcqExplain.classList.remove('hidden');
          mcqExplain.innerHTML = `
            <div class="font-bold ${isCorrect ? 'text-emerald-400' : 'text-amber-300'}">
              ${isCorrect ? '✓ Chính xác!' : '✗ Chưa chính xác — Hãy xem giải thích bẫy VSTEP:'}
            </div>
            <div>${esc(lesson.mcq.explain)}</div>
          `;
        }

        if (isCorrect) {
          global.LexiAcademy.markDone(lesson.id);
        }
      };
    });

    // 14. Chỉnh tốc độ 0.5x | 0.75x | 1x | 1.25x | 1.5x & Chuyển câu
    container.querySelectorAll('[data-studio-speed]').forEach((spdBtn) => {
      spdBtn.onclick = () => {
        playbackSpeed = Number(spdBtn.getAttribute('data-studio-speed')) || 1.0;
        if (typeof global.setAudioPlaybackRate === 'function') {
          global.setAudioPlaybackRate(playbackSpeed);
        }
        global.LexiAcademy.notify(`Đã chỉnh tốc độ phát âm: ${playbackSpeed}x`);
        global.LexiAcademy.render();
      };
    });

    const prevSegBtn = container.querySelector('#studio-prev-seg-btn');
    const nextSegBtn = container.querySelector('#studio-next-seg-btn');
    if (prevSegBtn) {
      prevSegBtn.onclick = () => {
        if (curSegIdx > 0) {
          stopActiveRecording();
          curSegIdx--;
          activePopoverWord = null;
          global.LexiAcademy.render();
        }
      };
    }
    if (nextSegBtn) {
      nextSegBtn.onclick = () => {
        stopActiveRecording();
        activePopoverWord = null;
        const step = mergeNext ? 2 : 1;
        if (curSegIdx + step < segs.length) {
          curSegIdx += step;
          global.LexiAcademy.render();
        } else {
          global.LexiAcademy.markDone(lesson.id);
          global.LexiAcademy.notify('🎉 Chúc mừng! Bạn đã hoàn thành toàn bộ các câu trong bài học này.');
          global.LexiAcademy.render();
        }
      };
    }

    // 15. Modal Thêm bài học mới từ YouTube / ELLLO.org
    const importModal = container.querySelector('#studio-import-modal');
    const openImportBtn = container.querySelector('#studio-open-import-modal');
    const closeImportBtn = container.querySelector('#studio-close-import-modal');
    const saveImportBtn = container.querySelector('#studio-save-import-btn');

    if (openImportBtn && importModal) {
      openImportBtn.onclick = () => importModal.classList.remove('hidden');
    }
    if (closeImportBtn && importModal) {
      closeImportBtn.onclick = () => importModal.classList.add('hidden');
    }
    if (saveImportBtn && importModal) {
      saveImportBtn.onclick = () => {
        const titleIn = container.querySelector('#imp-title');
        const ytIn = container.querySelector('#imp-yt');
        const scriptIn = container.querySelector('#imp-script');
        const viIn = container.querySelector('#imp-vi');

        const title = titleIn && titleIn.value.trim() ? titleIn.value.trim() : 'Bài luyện YouTube / ELLLO tự chọn';
        const rawYt = ytIn ? ytIn.value.trim() : '';
        const rawScript = scriptIn ? scriptIn.value.trim() : '';
        const rawVi = viIn ? viIn.value.trim() : '';

        if (!rawScript) {
          global.LexiAcademy.notify('Hãy dán ít nhất 1 câu tiếng Anh vào ô Nội dung kịch bản.');
          return;
        }

        // Bóc tách YouTube Video ID nếu người dùng dán URL đầy đủ
        let ytId = '';
        if (rawYt) {
          const m = rawYt.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
          ytId = m ? m[1] : rawYt.length === 11 ? rawYt : '';
        }

        const enLines = rawScript
          .split(/\n+|(?<=[.!?])\s+/)
          .map((s) => s.trim())
          .filter(Boolean);
        const viLines = rawVi
          .split(/\n+/)
          .map((s) => s.trim())
          .filter(Boolean);

        const newSegments = enLines.map((line, idx) => ({
          text: line,
          vi: viLines[idx] || 'Chạm vào từng từ để tra nghĩa chi tiết.',
          start: idx * 7,
          end: (idx + 1) * 7,
          ipaNote: 'Bấm "🔊 Nghe US" hoặc "Tách cụm" để luyện nhịp điệu chuẩn Mỹ.'
        }));

        const customList = getCustomLessons();
        const newLesson = {
          id: 'custom_' + Date.now(),
          level: lv,
          category: ytId ? 'YouTube Custom Lesson' : 'ELLLO / Custom Dialogue',
          title,
          youtubeId: ytId,
          sourceLabel: ytId ? 'YouTube Video + US Neural' : 'Custom Studio Lesson',
          segments: newSegments
        };
        customList.push(newLesson);
        saveCustomLessons(customList);

        const updatedList = getLessonsForLevel(lv);
        curLessonIdx = updatedList.length - 1;
        curSegIdx = 0;
        if (ytId) mediaTab = 'video';
        importModal.classList.add('hidden');
        global.LexiAcademy.notify('✓ Đã thêm bài học mới thành công!');
        global.LexiAcademy.render();
      };
    }
  }

  function getItems(lv) {
    return getLessonsForLevel(lv);
  }

  // Экспорт hàm dùng chung để module Speaking cũng dùng được bộ chấm thẻ Xanh/Vàng/Đỏ & IPA
  global.LexiStudioHelpers = {
    lookupWordInfo,
    cleanWordToken,
    evaluateSpokenWords,
    buildAICoachFeedbackHTML
  };

  if (global.LexiAcademy) {
    global.LexiAcademy.registerModule('listening', { render, bind, getItems });
  }
})(window);
