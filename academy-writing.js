/**
 * LexiContext Academy — Module Luyện Viết (academy-writing.js)
 * Thiết kế tối giản, tập trung thực hành:
 * - Cột trái: Dàn bài tiếng Việt (hiệu ứng sáng câu đang viết)
 * - Cột phải: Ô viết câu tiếng Anh + Gợi ý ẩn mặc định + Phân tích sâu từng vế câu & ngữ pháp trực tiếp trên câu của người học
 */
(function (global) {
  'use strict';

  // Danh sách từ viết hoa hợp lệ khi đứng giữa câu
  const VALID_MID_CAPS = new Set([
    'I',
    "I'm",
    'I’m',
    "I've",
    'I’ve',
    "I'll",
    'I’ll',
    "I'd",
    'I’d',
    'Jane',
    'An',
    'Alex',
    'Annie',
    'London',
    'English',
    'Vietnamese',
    'Vietnam',
    'Can',
    'Tho',
    'University',
    'Internet',
    'YouTube',
    'Facebook',
    'Google',
    'Sir',
    'Madam',
    'Mr',
    'Mrs',
    'Ms',
    'Dr',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
    'VSTEP',
    'B1',
    'B2',
    'TV',
    'IT',
    'AI'
  ]);

  const WRITING_DATA = {
    B1: [
      {
        id: 'vstep_b1_email_info',
        type: 'Task 1 • Viết thư (Email)',
        title: '1. Thư trả lời bạn nước ngoài (Jane hỏi về người bạn An)',
        prompt:
          'You received an email from your English friend, Jane. She asked you for some information about one of your friends, An, who wants to stay with Jane’s family in London this summer (personality, hobbies/interests, current work/study). Write an email (at least 120 words) responding to Jane.',
        formulaNote:
          'Chào hỏi → Hỏi thăm + Nêu mục đích (I am writing this email to...) → Trả lời 3 ý (First of all / Secondly / Finally) → Kết thư.',
        sentences: [
          {
            section: 'Phần 1: Mở đầu',
            vn: 'Chào Jane, dạo này bạn thế nào? Mình vẫn khỏe và hy vọng bạn cùng gia đình cũng đều khỏe mạnh.',
            structure:
              'Dear + Tên, How is it going? / How are you? I am doing well / I am fine and I hope you and your family are (doing) well too.',
            keywords: ['Dear Jane', 'How is it going', 'hope you and your family'],
            clauses: [
              {
                label: 'Lời chào đầu thư',
                regex: /\b(dear|hi|hello)\s+jane\b/i,
                goodMsg: 'Lời chào mở đầu thư chuẩn xác.',
                missingMsg: 'Thiếu lời chào mở đầu thư: "Dear Jane,".'
              },
              {
                label: 'Câu hỏi thăm sức khỏe',
                regex: /\bhow\s+(is\s+it\s+going|are\s+you(\s+today)?|have\s+you\s+been|are\s+things|is\s+everything)\b/i,
                goodMsg: 'Câu hỏi thăm đầu thư tự nhiên, đúng ngữ pháp.',
                missingMsg: 'Thiếu câu hỏi thăm đầu thư (ví dụ: "How are you?" hoặc "How is it going?").'
              },
              {
                label: 'Báo tin mình vẫn khỏe',
                regex: /\b(i\s+am|i'm|i’m)\s+(doing\s+well|doing\s+great|doing\s+fine|fine|well|good|great|okay)\b/i,
                partialRegex: /\bi\s+(very\s+well|fine|good|well|doing\s+well)\b/i,
                goodMsg: 'Cấu trúc báo tin sức khỏe của bản thân chính xác.',
                partialMsg: 'Thiếu động từ to be sau "I" (cần viết "I am fine" hoặc "I am doing well").',
                missingMsg: 'Thiếu ý báo tin mình vẫn khỏe ("I am fine" hoặc "I am doing well").'
              },
              {
                label: 'Hy vọng bạn và gia đình khỏe mạnh',
                regex: /\bhope\s+(that\s+)?you\s+and\s+your\s+family\s+are\s+(doing\s+well|doing\s+great|well|fine|good|great|healthy)(\s+too|\s+as\s+well)?\b/i,
                partialRegex: /\bhope\s+(that\s+)?you\s+and\s+your\s+family\b/i,
                goodMsg: 'Mệnh đề "hope you and your family are..." đúng cấu trúc và đủ ý.',
                partialMsg: 'Cụm "you and your family" là chủ ngữ số nhiều nên cần đi với "are well / are doing well (too)".',
                missingMsg: 'Thiếu vế chúc sức khỏe gia đình bạn ("and I hope you and your family are well too").'
              }
            ],
            commonErrors: [
              {
                pattern: /\bi\s+(very\s+well|fine|good)\b/i,
                fix: 'Thiếu động từ to be ở vế báo tin: Sửa thành "I am fine" hoặc "I am doing well".',
                replace: [/\bi\s+(very\s+well|fine|good)\b/i, 'I am $1']
              },
              {
                pattern: /\byou\s+and\s+your\s+family\s+is\b/i,
                fix: 'Sai sự hòa hợp chủ ngữ - động từ: "you and your family" là số nhiều nên phải dùng "are" (không dùng "is").',
                replace: [/\byou\s+and\s+your\s+family\s+is\b/i, 'you and your family are']
              }
            ],
            sample: 'Dear Jane, How is it going? I am doing well and I hope you and your family are doing well too.'
          },
          {
            section: 'Phần 1: Mở đầu',
            vn: 'Mình viết bức thư điện tử này để trả lời các câu hỏi của bạn về cô bạn thân của mình là An, người sẽ sang London vào mùa hè này.',
            structure:
              'I am writing this email to + V0 (answer your questions about...) + my best/close friend, An, who is going to + địa điểm + thời gian.',
            keywords: ['I am writing this email to', 'answer your questions', 'who is going to'],
            clauses: [
              {
                label: 'Nêu mục đích viết thư',
                regex: /\b(i\s+am|i'm|i’m)\s+writing\s+(this\s+(email|letter)\s+)?to\b/i,
                partialRegex: /\bi\s+(write|wrote|writing)\s+(this\s+(email|letter)\s+)?to\b/i,
                goodMsg: 'Dùng đúng thì Hiện tại tiếp diễn ("I am writing...") để nêu mục đích viết thư.',
                partialMsg:
                  'Bạn đang chia chưa đúng thì ở đầu câu ("I write" / "I wrote"). Khi nêu mục đích bức thư đang viết ngay lúc này, cần dùng Hiện tại tiếp diễn: "I am writing this email to...".',
                missingMsg: 'Thiếu cấu trúc mở đầu nêu mục đích viết thư: "I am writing this email to...".'
              },
              {
                label: 'Trả lời câu hỏi về người bạn thân An',
                regex: /\b(answer|respond\s+to|reply\s+to)\s+your\s+questions?\s+about\s+my\s+(best|close|good|dear)?\s*friend\s*,?\s*an\b/i,
                partialRegex: /\b(answer|respond|reply)\b.+\bfriend\b/i,
                goodMsg: 'Cụm chỉ mục đích trả lời câu hỏi về người bạn thân An diễn đạt tự nhiên, chuẩn xác.',
                partialMsg: 'Chú ý cấu trúc: "answer your questions about my best friend, An,".',
                missingMsg: 'Thiếu ý "trả lời các câu hỏi của bạn về người bạn thân An" (answer your questions about my best friend, An).'
              },
              {
                label: 'Mệnh đề quan hệ chỉ việc sang London mùa hè này',
                regex: /\bwho\s+(is\s+going\s+to(\s+visit|\s+stay\s+in|\s+come\s+to)?|will\s+(go\s+to|visit|come\s+to|stay\s+in)|is\s+coming\s+to)\s+london\s+this\s+summer\b/i,
                partialRegex: /\bwho\s+(is\s+going|will|goes|go)\b.+\blondon\b/i,
                goodMsg: 'Mệnh đề quan hệ "who is going to London this summer" chính xác 100%.',
                partialMsg: 'Kiểm tra lại mệnh đề quan hệ: dùng "who is going to London this summer" (không có "in" trước "this summer").',
                missingMsg: 'Thiếu mệnh đề quan hệ "who is going to London this summer".'
              }
            ],
            commonErrors: [
              {
                pattern: /\bi\s+write\s+this\s+(email|letter)\b/i,
                fix: 'Sai thì động từ: Bạn đang viết "I write this email" (Hiện tại đơn). Khi nêu mục đích bức thư đang viết ngay lúc này, hãy đổi "I write" thành "I am writing" (Hiện tại tiếp diễn).',
                replace: [/\bi\s+write\s+this\s+(email|letter)\b/i, 'I am writing this $1']
              },
              {
                pattern: /\bi\s+wrote\s+this\s+(email|letter)\b/i,
                fix: 'Sai thì động từ: Bạn đang viết "I wrote" (Quá khứ đơn). Khi đang viết bức thư này, hãy dùng Hiện tại tiếp diễn: "I am writing this email".',
                replace: [/\bi\s+wrote\s+this\s+(email|letter)\b/i, 'I am writing this $1']
              },
              {
                pattern: /\bi\s+writing\s+this\b/i,
                fix: 'Thiếu trợ động từ "am": Sửa "I writing" thành "I am writing".',
                replace: [/\bi\s+writing\s+this\b/i, 'I am writing this']
              },
              {
                pattern: /\banswer\s+your\s+question\s+about\b/i,
                fix: 'Danh từ số nhiều: Đề bài hỏi nhiều thông tin nên "question" cần thêm "-s" thành "questions" (answer your questions about...).',
                replace: [/\banswer\s+your\s+question\s+about\b/i, 'answer your questions about']
              },
              {
                pattern: /\bher\s+name\s+is\s+an\s*,?\s*who\b/i,
                fix: 'Lỗi cấu trúc mệnh đề: Không viết "my best friend, her name is An, who...". Hãy đặt tên "An" làm đồng vị ngữ ngay sau dấu phẩy: "my best friend, An, who...".',
                replace: [/\bher\s+name\s+is\s+an\s*,?\s*who\b/i, 'An, who']
              },
              {
                pattern: /\bin\s+this\s+summer\b/i,
                fix: 'Thừa giới từ "in": Trước "this / next / last + mùa" KHÔNG dùng giới từ "in". Hãy bỏ "in" và chỉ viết "this summer".',
                replace: [/\bin\s+this\s+summer\b/i, 'this summer']
              }
            ],
            sample:
              'I am writing this email to answer your questions about my best friend, An, who is going to London this summer.'
          },
          {
            section: 'Phần 2: Nội dung chính',
            vn: 'Trước hết, về tính cách của An, cô ấy là một người rất hòa đồng, tốt bụng và luôn sẵn lòng giúp đỡ mọi người xung quanh.',
            structure:
              'First of all, regarding her personality, she is + adj (sociable, kind-hearted) + and always willing to help others.',
            keywords: ['First of all', 'regarding her personality', 'sociable', 'willing to help'],
            clauses: [
              {
                label: 'Từ nối & giới thiệu chủ đề tính cách',
                regex: /\b(first\s+of\s+all|firstly|first|to\s+begin\s+with)\b.*?\b(personality|character)\b/i,
                partialRegex: /\b(first\s+of\s+all|firstly|first|personality|character)\b/i,
                goodMsg: 'Mở đầu ý thứ nhất và giới thiệu chủ đề tính cách (personality) rõ ràng.',
                partialMsg: 'Nên kết hợp từ nối "First of all," và cụm giới thiệu "regarding her personality,".',
                missingMsg: 'Thiếu cụm mở đầu ý 1: "First of all, regarding her personality,".'
              },
              {
                label: 'Miêu tả tính cách hòa đồng, tốt bụng',
                regex: /\bshe\s+is\s+(a\s+)?(very\s+|really\s+|quite\s+|extremely\s+)?(sociable|friendly|outgoing|extroverted|kind|kind-hearted|nice|warm-hearted|helpful)/i,
                partialRegex: /\bshe\s+(very\s+)?(sociable|friendly|outgoing|kind|kind-hearted)\b/i,
                goodMsg: 'Cấu trúc "she is + tính từ chỉ tính cách" chính xác.',
                partialMsg: 'Thiếu động từ to be "is" sau chủ ngữ "she" (cần viết "she is very sociable...").',
                missingMsg: 'Thiếu vế miêu tả tính cách: "she is very sociable and kind-hearted".'
              },
              {
                label: 'Luôn sẵn lòng giúp đỡ mọi người',
                regex: /\b(willing|ready|happy)\s+to\s+help\s+(other\s+people|others|people(\s+around\s+her)?|everyone)\b/i,
                partialRegex: /\bhelp\s+(other\s+people|others|people|everyone)\b/i,
                goodMsg: 'Cụm "willing to help..." dùng rất tự nhiên và đúng cấu trúc.',
                partialMsg: 'Nên dùng cấu trúc "always willing to help people around her / others" để câu giàu sức biểu đạt hơn.',
                missingMsg: 'Thiếu vế "and always willing to help people around her".'
              }
            ],
            commonErrors: [
              {
                pattern: /\bshe\s+very\s+(sociable|kind|friendly|outgoing|nice)\b/i,
                fix: 'Thiếu động từ to be: Trong tiếng Anh, trước tính từ phải có to be → sửa "she very..." thành "she is very...".',
                replace: [/\bshe\s+very\s+(sociable|kind|friendly|outgoing|nice)\b/i, 'she is very $1']
              },
              {
                pattern: /\bhelp\s+people\s+around\s+she\b/i,
                fix: 'Sai đại từ tân ngữ: Sau giới từ "around" phải dùng tân ngữ "her" (around her), không dùng đại từ chủ ngữ "she".',
                replace: [/\bhelp\s+people\s+around\s+she\b/i, 'help people around her']
              },
              {
                pattern: /\bwilling\s+help\b/i,
                fix: 'Thiếu giới từ "to": Cấu trúc đúng là "willing to + V0" → sửa thành "willing to help".',
                replace: [/\bwilling\s+help\b/i, 'willing to help']
              }
            ],
            sample:
              'First of all, regarding her personality, she is very sociable, kind-hearted, and always willing to help people around her.'
          },
          {
            section: 'Phần 2: Nội dung chính',
            vn: 'Thứ hai, về sở thích cá nhân, cô ấy rất thích đọc sách tiếng Anh, nấu các món ăn truyền thống Việt Nam và chụp ảnh.',
            structure:
              'Secondly / What is more, when it comes to her hobbies, she is keen on / enjoys + V-ing (reading..., cooking..., and taking...).',
            keywords: ['Secondly', 'hobbies', 'keen on', 'reading English books', 'cooking'],
            clauses: [
              {
                label: 'Từ nối & giới thiệu sở thích',
                regex: /\b(secondly|second|what\s+is\s+more|moreover|besides|in\s+addition)\b.*?\b(hobbies|interests|free\s+time)\b/i,
                partialRegex: /\b(secondly|second|what\s+is\s+more|moreover|besides|hobbies|interests)\b/i,
                goodMsg: 'Chuyển ý mạch lạc sang phần sở thích (hobbies/interests).',
                partialMsg: 'Nên có cả từ nối ("Secondly," / "What is more,") và cụm nêu chủ đề ("when it comes to her hobbies," / "regarding her hobbies,").',
                missingMsg: 'Thiếu cụm chuyển ý sang sở thích: "Secondly, when it comes to her hobbies,".'
              },
              {
                label: 'Cấu trúc yêu thích (enjoy / keen on / like)',
                regex: /\bshe\s+(is\s+(really\s+|very\s+)?(keen\s+on|fond\s+of|interested\s+in|into)|(really\s+)?(enjoys|likes|loves))\b/i,
                goodMsg: 'Dùng đúng cấu trúc chỉ sở thích theo sau chủ ngữ "she".',
                missingMsg: 'Thiếu cụm động từ chỉ sở thích: "she is keen on" hoặc "she really enjoys / likes".'
              },
              {
                label: 'Liệt kê 3 hoạt động dạng V-ing song song',
                regex: /\breading\b.*\bcooking\b.*\b(taking\s+(photos|pictures)|photographing)\b/i,
                partialRegex: /\b(reading|read)\b.*\b(cooking|cook)\b/i,
                goodMsg: 'Chia đúng cấu trúc song song V-ing (reading..., cooking..., and taking photos).',
                partialMsg: 'Cần đảm bảo cả 3 hoạt động đều chia ở dạng V-ing: "reading English books, cooking traditional Vietnamese food, and taking photos".',
                missingMsg: 'Thiếu các hoạt động sở thích: "reading English books, cooking traditional Vietnamese food, and taking photos".'
              }
            ],
            commonErrors: [
              {
                pattern: /\b(keen\s+on|fond\s+of|interested\s+in|enjoys?|likes?)\s+(read|cook|take)\b/i,
                fix: 'Sai dạng động từ: Sau "keen on / fond of / enjoy / like", động từ phải thêm đuôi "-ing" (reading, cooking, taking).',
                replace: [/\b(keen\s+on|fond\s+of|interested\s+in|enjoys?)\s+read\b/i, '$1 reading']
              },
              {
                pattern: /\bshe\s+(enjoy|like|love)\b/i,
                fix: 'Lỗi chia động từ: Chủ ngữ "she" là ngôi thứ 3 số ít nên động từ phải thêm "-s" ("she enjoys" / "she likes").',
                replace: [/\bshe\s+(enjoy|like|love)\b/i, 'she $1s']
              }
            ],
            sample:
              'Secondly, when it comes to her hobbies, she is keen on reading English books, cooking traditional Vietnamese food, and taking photos.'
          },
          {
            section: 'Phần 2: Nội dung chính',
            vn: 'Cuối cùng, hiện tại cô ấy đang là sinh viên năm cuối tại một trường đại học và học tập vô cùng chăm chỉ.',
            structure:
              'Finally / Last but not least, she is currently a final-year university student and studies very hard.',
            keywords: ['Finally', 'currently', 'final-year student', 'studies very hard'],
            clauses: [
              {
                label: 'Từ nối mở đầu ý cuối',
                regex: /\b(finally|last\s+but\s+not\s+least|lastly)\b/i,
                goodMsg: 'Dùng đúng từ nối mở đầu ý cuối cùng.',
                missingMsg: 'Thiếu từ nối mở đầu ý cuối: "Finally," hoặc "Last but not least,".'
              },
              {
                label: 'Giới thiệu là sinh viên năm cuối đại học',
                regex: /\bshe\s+is\s+(currently\s+|now\s+)?a\s+(final-year|senior|last-year|fourth-year)\s+(student|university\s+student)/i,
                partialRegex: /\bshe\s+is\b.*\bstudent\b/i,
                goodMsg: 'Diễn đạt chính xác ý "cô ấy hiện là sinh viên năm cuối đại học".',
                partialMsg: 'Để diễn đạt "sinh viên năm cuối", hãy dùng cụm danh từ: "a final-year student at a university" hoặc "a final-year university student".',
                missingMsg: 'Thiếu ý "she is currently a final-year student at a university".'
              },
              {
                label: 'Học tập rất chăm chỉ',
                regex: /\b(studies|works|is\s+studying)\s+(very\s+|really\s+|extremely\s+|so\s+)?hard\b/i,
                partialRegex: /\b(study|studies)\b/i,
                goodMsg: 'Cụm "studies very hard" chia đúng động từ ngôi thứ 3 số ít và dùng đúng trạng từ "hard".',
                partialMsg: 'Chú ý chia động từ theo chủ ngữ "she": phải là "studies very hard" (đổi y -> ies).',
                missingMsg: 'Thiếu vế "and studies very hard" (và học tập vô cùng chăm chỉ).'
              }
            ],
            commonErrors: [
              {
                pattern: /\bshe\s+(.*?\b)?study\s+(very\s+|really\s+)?hard\b/i,
                fix: 'Lỗi chia động từ: Chủ ngữ là "she" (ngôi thứ 3 số ít) nên động từ "study" phải chia thành "studies" (đổi y thành ies).',
                replace: [/\bstudy\s+((?:very\s+|really\s+)?hard)\b/i, 'studies $1']
              },
              {
                pattern: /\bhardly\b/i,
                fix: 'Sai từ vựng: "hardly" có nghĩa là "hầu như không". Để nói "học chăm chỉ", trạng từ đúng là "hard" (studies very hard).',
                replace: [/\bhardly\b/i, 'hard']
              },
              {
                pattern: /\bfinal\s+years\s+student\b/i,
                fix: 'Sai tính từ ghép: Khi đứng trước danh từ "student", cụm "final-year" đóng vai trò tính từ nên không thêm "-s".',
                replace: [/\bfinal\s+years\s+student\b/i, 'final-year student']
              }
            ],
            sample:
              'Finally, she is currently a final-year student at a local university and studies very hard.'
          },
          {
            section: 'Phần 3: Kết thư',
            vn: 'Mình chắc chắn rằng An sẽ hòa nhập rất tốt với gia đình của bạn. Cảm ơn bạn đã đọc thư và mình rất mong sớm nhận được hồi âm từ bạn. Thân mến, Annie.',
            structure:
              'I am sure she will fit in well with your family. Thank you for reading my email. I look forward to hearing from you soon. Best regards, Annie.',
            keywords: ['fit in well', 'Thank you for reading', 'looking forward to hearing from you', 'Best regards'],
            clauses: [
              {
                label: 'Chắc chắn An sẽ hòa nhập tốt với gia đình bạn',
                regex: /\b(i\s+am|i'm|i’m)\s+(sure|certain|confident)\s+(that\s+)?(an|she)\s+will\s+(fit\s+in\s+well\s+with|get\s+along\s+well\s+with|adapt\s+well\s+to)\s+your\s+family\b/i,
                partialRegex: /\b(sure|certain|believe)\b.*\bfamily\b/i,
                goodMsg: 'Cấu trúc "I am sure she will fit in well with your family" rất tự nhiên.',
                partialMsg: 'Gợi ý cụm từ ăn điểm: "fit in well with your family" hoặc "get along well with your family".',
                missingMsg: 'Thiếu câu đầu kết thư: "I am sure she will fit in well with your family."'
              },
              {
                label: 'Cảm ơn và mong sớm nhận được hồi âm',
                regex: /\blook(ing)?\s+forward\s+to\s+hearing\s+from\s+you(\s+soon)?\b/i,
                partialRegex: /\blook(ing)?\s+forward\s+to\b/i,
                goodMsg: 'Dùng chuẩn xác cấu trúc "look(ing) forward to hearing from you soon".',
                partialMsg: 'Sau cụm "look forward to", chữ "to" là giới từ nên động từ phải thêm "-ing": "hearing from you soon".',
                missingMsg: 'Thiếu câu mong nhận hồi âm: "I am looking forward to hearing from you soon."'
              },
              {
                label: 'Lời chào kết thư & ký tên',
                regex: /\b(best\s+regards|best\s+wishes|warm\s+regards|yours\s+truly|love)\s*,?\s*annie\b/i,
                partialRegex: /\b(best\s+regards|best\s+wishes|warm\s+regards|annie)\b/i,
                goodMsg: 'Có đầy đủ lời chào kết thư và ký tên.',
                partialMsg: 'Kết thư cần có lời chúc ("Best regards,") và tên người viết ("Annie.").',
                missingMsg: 'Thiếu phần kết thư & ký tên: "Best regards, Annie."'
              }
            ],
            commonErrors: [
              {
                pattern: /\blook(ing)?\s+forward\s+to\s+hear\b/i,
                fix: 'Lỗi ngữ pháp kinh điển: Trong cụm "look forward to", từ "to" là giới từ nên theo sau bắt buộc là V-ing → sửa "hear" thành "hearing".',
                replace: [/\b(look(?:ing)?\s+forward\s+to)\s+hear\b/i, '$1 hearing']
              }
            ],
            sample:
              'I am sure she will fit in well with your family. Thank you for reading my email. I am looking forward to hearing from you soon. Best regards, Annie.'
          }
        ]
      },
      {
        id: 'vstep_b1_email_advice',
        type: 'Task 1 • Viết thư (Email)',
        title: '2. Thư khuyên bạn cách cải thiện sức khỏe & giảm căng thẳng',
        prompt:
          'Your friend Alex wrote an email saying he feels exhausted and stressed because of studying late and eating fast food. Write an email (at least 120 words) to give him some advice on how to stay healthy and study effectively.',
        formulaNote:
          'Hỏi thăm → Nêu mục đích khuyên (give you some advice) → 3 lời khuyên (If I were you / I suggest that / It would be a good idea) → Kết thư.',
        sentences: [
          {
            section: 'Phần 1: Mở đầu',
            vn: 'Chào Alex, mọi việc thế nào rồi? Mình rất tiếc khi nghe về những vấn đề căng thẳng và mệt mỏi của bạn dạo gần đây.',
            structure:
              'Dear Alex, How is it going? / How are you? I was sorry to hear about your stress and exhaustion recently.',
            keywords: ['Dear Alex', 'sorry to hear about', 'stress'],
            clauses: [
              {
                label: 'Lời chào & hỏi thăm Alex',
                regex: /\b(dear|hi|hello)\s+alex\b.*?\bhow\s+(is\s+it\s+going|are\s+you|are\s+things|is\s+everything)\b/i,
                partialRegex: /\b(dear|hi|hello)\s+alex\b/i,
                goodMsg: 'Lời chào và hỏi thăm đầu thư tự nhiên.',
                partialMsg: 'Bổ sung thêm câu hỏi thăm ngắn sau "Dear Alex," (ví dụ: "How is it going?").',
                missingMsg: 'Thiếu lời chào mở đầu: "Dear Alex, How is it going?".'
              },
              {
                label: 'Chia sẻ sự cảm thông khi nghe về vấn đề của bạn',
                regex: /\b(i\s+was|i\s+am|i'm|i’m)\s+(really\s+|very\s+|so\s+)?sorry\s+to\s+hear\s+(about|that)\b/i,
                partialRegex: /\bsorry\b.*\bhear\b/i,
                goodMsg: 'Dùng đúng cấu trúc cảm thông "I was/am sorry to hear about...".',
                partialMsg: 'Cấu trúc chuẩn là "I was sorry to hear about your stress and exhaustion recently."',
                missingMsg: 'Thiếu vế chia sẻ: "I was sorry to hear about your stress and exhaustion recently."'
              }
            ],
            commonErrors: [],
            sample:
              'Dear Alex, How is it going? I was really sorry to hear about your stress and exhaustion recently.'
          },
          {
            section: 'Phần 1: Mở đầu',
            vn: 'Mình viết bức thư này để đưa cho bạn một vài lời khuyên hữu ích giúp bạn vượt qua giai đoạn khó khăn này.',
            structure:
              'I am writing this email to give you some useful advice to help you overcome this difficult time.',
            keywords: ['I am writing this email to', 'give you some useful advice', 'overcome'],
            clauses: [
              {
                label: 'Nêu mục đích viết thư khuyên',
                regex: /\b(i\s+am|i'm|i’m)\s+writing\s+(this\s+(email|letter)\s+)?to\s+give\s+you\s+some\s+(useful\s+|helpful\s+)?advice\b/i,
                partialRegex: /\b(writing|write)\b.*\badvice\b/i,
                goodMsg: 'Nêu mục đích đưa lời khuyên chính xác, dùng đúng danh từ không đếm được "advice".',
                partialMsg: 'Chú ý dùng thì Hiện tại tiếp diễn "I am writing this email to give you some useful advice".',
                missingMsg: 'Thiếu cấu trúc mục đích: "I am writing this email to give you some useful advice".'
              },
              {
                label: 'Giúp vượt qua giai đoạn khó khăn',
                regex: /\b(overcome|get\s+through|deal\s+with)\s+this\s+(difficult|hard|tough)\s+(time|period)\b/i,
                goodMsg: 'Cụm "overcome this difficult time" rất tự nhiên và đúng chuẩn B1/B2.',
                missingMsg: 'Thiếu vế sau: "to help you overcome this difficult time".'
              }
            ],
            commonErrors: [
              {
                pattern: /\badvices\b|\ban\s+(useful\s+)?advice\b|\ba\s+(useful\s+)?advice\b/i,
                fix: 'Lỗi danh từ không đếm được: "advice" KHÔNG có dạng số nhiều "advices" và không đi với "a/an". Hãy dùng "some useful advice".',
                replace: [/\b(an?|some)?\s*(useful\s+)?advices?\b/i, 'some $2advice']
              },
              {
                pattern: /\bi\s+write\s+this\b/i,
                fix: 'Đổi "I write" (Hiện tại đơn) thành "I am writing" (Hiện tại tiếp diễn) khi nêu mục đích bức thư đang viết.',
                replace: [/\bi\s+write\s+this\b/i, 'I am writing this']
              }
            ],
            sample:
              'I am writing this email to give you some useful advice to help you overcome this difficult time.'
          },
          {
            section: 'Phần 2: Lời khuyên',
            vn: 'Trước hết, nếu mình là bạn, mình sẽ ngừng ăn đồ ăn nhanh và bắt đầu nấu các bữa ăn lành mạnh có nhiều rau xanh và trái cây.',
            structure:
              'First of all, if I were you, I would stop + V-ing (eating fast food) and start + V-ing (cooking healthy meals) with vegetables and fruit.',
            keywords: ['First of all', 'if I were you, I would', 'stop eating fast food', 'healthy meals'],
            clauses: [
              {
                label: 'Cấu trúc khuyên Câu điều kiện loại 2',
                regex: /\b(first\s+of\s+all|firstly|first)\s*,\s*if\s+i\s+were\s+you\s*,\s*i\s+would\b/i,
                partialRegex: /\bif\s+i\s+(were|was)\s+you\b/i,
                goodMsg: 'Dùng chuẩn cấu trúc khuyên câu điều kiện loại 2: "First of all, if I were you, I would...".',
                partialMsg: 'Cấu trúc chuẩn: "First of all, if I were you, I would + V0".',
                missingMsg: 'Thiếu cấu trúc khuyên mở đầu: "First of all, if I were you, I would...".'
              },
              {
                label: 'Ngừng ăn đồ ăn nhanh & nấu bữa ăn lành mạnh',
                regex: /\bstop\s+eating\s+(fast\s+food|junk\s+food)\s+and\s+start\s+(cooking|making|eating|having)\s+healthy\s+(meals|food)/i,
                partialRegex: /\bstop\b.*\bfast\s+food\b/i,
                goodMsg: 'Chia đúng cấu trúc "stop + V-ing" (stop eating fast food) và "start + V-ing / to V".',
                partialMsg: 'Sau động từ "stop" (dừng hẳn thói quen) phải dùng V-ing: "stop eating fast food".',
                missingMsg: 'Thiếu nội dung lời khuyên: "stop eating fast food and start cooking healthy meals with vegetables and fruit".'
              }
            ],
            commonErrors: [
              {
                pattern: /\bstop\s+to\s+eat\b/i,
                fix: 'Sai cấu trúc: "stop to eat" có nghĩa là dừng việc khác lại để ăn. Muốn nói "ngừng hẳn việc ăn đồ ăn nhanh" phải dùng "stop + V-ing" → "stop eating".',
                replace: [/\bstop\s+to\s+eat\b/i, 'stop eating']
              },
              {
                pattern: /\bif\s+i\s+am\s+you\b/i,
                fix: 'Sai câu điều kiện: Giả định không có thật ở hiện tại phải dùng câu điều kiện loại 2: "If I were you, I would...".',
                replace: [/\bif\s+i\s+am\s+you\b/i, 'if I were you']
              }
            ],
            sample:
              'First of all, if I were you, I would stop eating fast food and start cooking healthy meals with vegetables and fruit.'
          },
          {
            section: 'Phần 2: Lời khuyên',
            vn: 'Hơn thế nữa, mình muốn đề xuất rằng bạn nên lập một thời gian biểu học tập hợp lý và đi ngủ trước 11 giờ đêm mỗi ngày.',
            structure:
              'What is more / Moreover, I would like to suggest that you (should) make a reasonable study schedule and go to bed before 11 p.m. every day.',
            keywords: ['What is more', 'suggest that you', 'reasonable study schedule', 'go to bed'],
            clauses: [
              {
                label: 'Từ nối & cấu trúc đề xuất (suggest that you)',
                regex: /\b(what\s+is\s+more|moreover|secondly|besides|in\s+addition)\b.*?\bsuggest\s+that\s+you\b/i,
                partialRegex: /\bsuggest\b/i,
                goodMsg: 'Dùng đúng cấu trúc đề xuất "suggest that you + (should) + V0".',
                partialMsg: 'Lưu ý: Động từ "suggest" đi với mệnh đề "suggest that you (should) + V0", không dùng "suggest you to V".',
                missingMsg: 'Thiếu cấu trúc khuyên thứ 2: "What is more, I would like to suggest that you...".'
              },
              {
                label: 'Lập thời gian biểu & đi ngủ trước 11 giờ đêm',
                regex: /\b(make|create|set|have)\s+a\s+(reasonable|good|proper|suitable)\s+(study\s+)?(schedule|timetable)\s+and\s+(go\s+to\s+bed|sleep)\s+before\s+11/i,
                partialRegex: /\b(schedule|timetable)\b.*\b(go\s+to\s+bed|sleep)\b/i,
                goodMsg: 'Diễn đạt rõ ràng cả 2 hành động: lập thời gian biểu hợp lý và đi ngủ trước 11 giờ.',
                partialMsg: 'Cụm từ gợi ý chuẩn: "make a reasonable study schedule and go to bed before 11 p.m. every day".',
                missingMsg: 'Thiếu nội dung: "make a reasonable study schedule and go to bed before 11 p.m. every day".'
              }
            ],
            commonErrors: [
              {
                pattern: /\bsuggest\s+you\s+to\b/i,
                fix: 'Lỗi cấu trúc ngữ pháp: "suggest" KHÔNG đi với tân ngữ + to V ("suggest you to..."). Hãy sửa thành "suggest that you + V0".',
                replace: [/\bsuggest\s+you\s+to\b/i, 'suggest that you']
              }
            ],
            sample:
              'What is more, I would like to suggest that you make a reasonable study schedule and go to bed before 11 p.m. every day.'
          },
          {
            section: 'Phần 2: Lời khuyên',
            vn: 'Cuối cùng, sẽ là một ý kiến rất hay khi bạn dành 30 phút mỗi ngày để chạy bộ hoặc nghe nhạc nhẹ nhằm giải tỏa áp lực.',
            structure:
              'Finally, it would be a good idea if you spend 30 minutes a day + V-ing (jogging or listening to soft music) to reduce stress.',
            keywords: ['Finally', 'it would be a good idea', 'spend 30 minutes', 'jogging', 'reduce stress'],
            clauses: [
              {
                label: 'Cấu trúc khuyên "It would be a good idea"',
                regex: /\b(finally|lastly|last\s+but\s+not\s+least)\s*,\s*it\s+would\s+be\s+a\s+(good|great)\s+idea\s+(if\s+you|when\s+you|to)\b/i,
                partialRegex: /\bgood\s+idea\b/i,
                goodMsg: 'Mở đầu lời khuyên cuối bằng "Finally, it would be a good idea if you..." rất chuẩn.',
                partialMsg: 'Hãy dùng nguyên cụm: "Finally, it would be a good idea if you...".',
                missingMsg: 'Thiếu cấu trúc khuyên thứ 3: "Finally, it would be a good idea if you...".'
              },
              {
                label: 'Cấu trúc "spend + thời gian + V-ing"',
                regex: /\bspend\s+30\s+minutes\s+(a\s+day|every\s+day)\s+(jogging|running)\s+or\s+listening\b/i,
                partialRegex: /\bspend\s+30\s+minutes\b/i,
                goodMsg: 'Chia đúng cấu trúc "spend + thời gian + V-ing" (jogging or listening).',
                partialMsg: 'Sau "spend 30 minutes a day", động từ phải ở dạng V-ing: "jogging or listening to soft music".',
                missingMsg: 'Thiếu cụm "spend 30 minutes a day jogging or listening to soft music to reduce stress".'
              }
            ],
            commonErrors: [
              {
                pattern: /\bspend\s+30\s+minutes\s+(a\s+day\s+|every\s+day\s+)?to\s+(jog|run|listen)\b/i,
                fix: 'Sai cấu trúc "spend": Sau "spend + thời gian" bắt buộc dùng V-ing (jogging / listening), KHÔNG dùng "to V".',
                replace: [/\bspend\s+30\s+minutes\s+(a\s+day\s+|every\s+day\s+)?to\s+jog\b/i, 'spend 30 minutes $1jogging']
              }
            ],
            sample:
              'Finally, it would be a good idea if you spend 30 minutes a day jogging or listening to soft music to reduce stress.'
          },
          {
            section: 'Phần 3: Kết thư',
            vn: 'Đừng lo lắng quá nhé, mọi chuyện rồi sẽ ổn thôi! Mình hy vọng lời khuyên của mình sẽ giúp ích cho bạn. Viết thư lại cho mình sớm nhé. Thân ái, Annie.',
            structure:
              'Do not worry! Everything will be okay. I hope my advice can help you. Write to me soon. Best wishes, Annie.',
            keywords: ['Everything will be okay', 'hope my advice', 'Write to me soon', 'Best wishes'],
            clauses: [
              {
                label: 'Động viên bạn',
                regex: /\b(do\s+not|don't|don’t)\s+worry.*?\beverything\s+will\s+be\s+(okay|ok|fine|alright)\b/i,
                partialRegex: /\beverything\s+will\s+be\s+(okay|ok|fine|alright)\b/i,
                goodMsg: 'Câu động viên tự nhiên, ấm áp.',
                partialMsg: 'Có thể thêm "Do not worry! Everything will be okay."',
                missingMsg: 'Thiếu câu động viên: "Do not worry! Everything will be okay."'
              },
              {
                label: 'Hy vọng lời khuyên hữu ích & mong hồi âm',
                regex: /\bhope\s+(that\s+)?my\s+advice\s+(can|will)\s+help\s+you\b/i,
                goodMsg: 'Câu chúc kết thư "I hope my advice can help you" chính xác.',
                missingMsg: 'Thiếu câu "I hope my advice can help you. Write to me soon."'
              },
              {
                label: 'Chào kết thư & ký tên',
                regex: /\b(best\s+wishes|best\s+regards|warm\s+regards)\s*,?\s*annie\b/i,
                goodMsg: 'Kết thư và ký tên chuẩn.',
                missingMsg: 'Thiếu lời chào kết thư: "Best wishes, Annie."'
              }
            ],
            commonErrors: [],
            sample:
              'Do not worry! Everything will be okay. I hope my advice can help you. Write to me soon. Best wishes, Annie.'
          }
        ]
      },
      {
        id: 'vstep_b1_email_complaint',
        type: 'Task 1 • Viết thư (Email)',
        title: '3. Thư phàn nàn về sản phẩm mua online bị lỗi',
        prompt:
          'You bought a laptop online from a store last week, but when it arrived, the screen was scratched and the battery did not work properly. Write an email (at least 120 words) to the store manager to complain about the product and ask for a solution.',
        formulaNote:
          'Dear Sir or Madam → Mục đích (complain about...) → Sự cố (When I received...) → Hậu quả (Therefore...) → Yêu cầu giải pháp (replace / refund) → Yours faithfully.',
        sentences: [
          {
            section: 'Phần 1: Mở đầu',
            vn: 'Kính gửi Quý Ông/Bà, tôi viết bức thư điện tử này để phàn nàn về chiếc máy tính xách tay mà tôi đã mua từ cửa hàng trực tuyến của quý công ty vào tuần trước.',
            structure:
              'Dear Sir or Madam, I am writing this email to complain about the laptop that I bought from your online store last week.',
            keywords: ['Dear Sir or Madam', 'complain about', 'bought', 'last week'],
            clauses: [
              {
                label: 'Lời chào trang trọng',
                regex: /\bdear\s+sir\s+or\s+madam\b/i,
                goodMsg: 'Dùng đúng lời chào trang trọng "Dear Sir or Madam,".',
                missingMsg: 'Thư trang trọng gửi quản lý cửa hàng cần mở đầu bằng "Dear Sir or Madam,".'
              },
              {
                label: 'Nêu mục đích phàn nàn về chiếc laptop',
                regex: /\b(i\s+am|i'm|i’m)\s+writing\s+(this\s+(email|letter)\s+)?to\s+complain\s+about\s+(the|a)\s+laptop\b/i,
                partialRegex: /\bcomplain\s+about\b/i,
                goodMsg: 'Cấu trúc "I am writing this email to complain about the laptop" chuẩn xác.',
                partialMsg: 'Dùng thì Hiện tại tiếp diễn: "I am writing this email to complain about the laptop".',
                missingMsg: 'Thiếu cấu trúc nêu mục đích phàn nàn: "I am writing this email to complain about the laptop".'
              },
              {
                label: 'Mệnh đề quan hệ ở thì Quá khứ đơn (mua tuần trước)',
                regex: /\b(that|which)?\s*i\s+(bought|purchased|ordered)\s+from\s+your\s+(online\s+)?(store|shop)\s+last\s+week\b/i,
                partialRegex: /\bi\s+(buy|bought|purchased)\b.*\blast\s+week\b/i,
                goodMsg: 'Chia đúng động từ quá khứ "bought / purchased" đi với trạng từ "last week".',
                partialMsg: 'Vì có "last week" (tuần trước) nên động từ "buy" phải chia ở Quá khứ đơn là "bought".',
                missingMsg: 'Thiếu mệnh đề "that I bought from your online store last week".'
              }
            ],
            commonErrors: [
              {
                pattern: /\bi\s+buy\b(.*?\blast\s+week\b)/i,
                fix: 'Sai thì động từ: Có "last week" (tuần trước) nên động từ "buy" phải chia Quá khứ đơn là "bought".',
                replace: [/\bi\s+buy\b/i, 'I bought']
              }
            ],
            sample:
              'Dear Sir or Madam, I am writing this email to complain about the laptop that I bought from your online store last week.'
          },
          {
            section: 'Phần 2: Vấn đề & Hậu quả',
            vn: 'Khi tôi nhận được hàng vào hôm qua, tôi vô cùng thất vọng vì màn hình bị trầy xước và pin không hoạt động bình thường.',
            structure:
              'When I received the package yesterday, I was very disappointed because the screen was scratched and the battery did not work properly.',
            keywords: ['When I received', 'disappointed', 'screen was scratched', 'battery did not work'],
            clauses: [
              {
                label: 'Khi nhận hàng hôm qua & cảm thấy thất vọng',
                regex: /\bwhen\s+i\s+(received|got)\s+the\s+(package|laptop|product|item)\s+yesterday\s*,\s*i\s+(was|felt)\s+(very\s+|really\s+|extremely\s+|so\s+)?disappointed\b/i,
                partialRegex: /\bdisappointed\b/i,
                goodMsg: 'Dùng đúng thì Quá khứ đơn và tính từ cảm xúc đuôi -ed ("I was very disappointed").',
                partialMsg: 'Chú ý cấu trúc: "When I received the package yesterday, I was very disappointed".',
                missingMsg: 'Thiếu vế đầu: "When I received the package yesterday, I was very disappointed".'
              },
              {
                label: 'Mô tả lỗi màn hình trầy xước & pin hỏng',
                regex: /\bbecause\s+the\s+screen\s+was\s+scratched\s+and\s+the\s+battery\s+did\s+not\s+work(\s+properly|\s+well)?\b/i,
                partialRegex: /\bscreen\b.*\bbattery\b/i,
                goodMsg: 'Mô tả 2 lỗi kỹ thuật ở thì Quá khứ đơn ("was scratched" & "did not work properly") hoàn toàn chính xác.',
                partialMsg: 'Chú ý chia Quá khứ đơn: "because the screen was scratched and the battery did not work properly".',
                missingMsg: 'Thiếu vế nêu lý do: "because the screen was scratched and the battery did not work properly".'
              }
            ],
            commonErrors: [
              {
                pattern: /\bi\s+(was|felt)\s+(very\s+)?disappointing\b/i,
                fix: 'Sai tính từ đuôi -ing/-ed: Để diễn tả cảm xúc của người, phải dùng tính từ đuôi "-ed" ("disappointed"), không dùng "disappointing".',
                replace: [/\bdisappointing\b/i, 'disappointed']
              }
            ],
            sample:
              'When I received the package yesterday, I was very disappointed because the screen was scratched and the battery did not work properly.'
          },
          {
            section: 'Phần 2: Vấn đề & Hậu quả',
            vn: 'Do đó, sự cố này đã làm gián đoạn nghiêm trọng công việc hàng ngày cũng như việc học trực tuyến của tôi.',
            structure:
              'Therefore / As a result, this problem has seriously disrupted / affected my daily work and online study.',
            keywords: ['Therefore', 'this problem has', 'daily work', 'online study'],
            clauses: [
              {
                label: 'Từ nối chỉ kết quả (Therefore / As a result)',
                regex: /\b(therefore|as\s+a\s+result|consequently|thus)\b/i,
                goodMsg: 'Dùng từ nối chỉ kết quả chuẩn xác.',
                missingMsg: 'Thiếu từ nối chỉ kết quả ở đầu câu: "Therefore," hoặc "As a result,".'
              },
              {
                label: 'Ảnh hưởng đến công việc và việc học trực tuyến',
                regex: /\bthis\s+(problem|issue)\s+(has\s+)?(seriously\s+)?(disrupted|affected|interrupted)\s+my\s+daily\s+work\s+and\s+online\s+(study|learning)\b/i,
                partialRegex: /\b(daily\s+work|online\s+study)\b/i,
                goodMsg: 'Cấu trúc nêu hậu quả đối với công việc và học tập rất mạch lạc.',
                partialMsg: 'Gợi ý cụm chuẩn: "this problem has seriously disrupted/affected my daily work and online study".',
                missingMsg: 'Thiếu nội dung: "this problem has seriously disrupted my daily work and online study".'
              }
            ],
            commonErrors: [],
            sample: 'Therefore, this problem has seriously disrupted my daily work and online study.'
          },
          {
            section: 'Phần 3: Yêu cầu giải quyết',
            vn: 'Vì sản phẩm này vẫn còn trong thời hạn bảo hành, tôi muốn yêu cầu quý cửa hàng đổi cho tôi một chiếc máy mới hoặc hoàn lại toàn bộ số tiền.',
            structure:
              'Since / Because this product is still under warranty, I would like to request that you replace it with a new one or give me a full refund.',
            keywords: ['under warranty', 'request that you', 'replace it with a new one', 'full refund'],
            clauses: [
              {
                label: 'Mệnh đề lý do "còn trong thời gian bảo hành"',
                regex: /\b(since|because|as)\s+this\s+(product|laptop|item)\s+is\s+(still\s+)?under\s+warranty\b/i,
                partialRegex: /\bunder\s+warranty\b/i,
                goodMsg: 'Dùng đúng cụm cố định "under warranty" (trong thời hạn bảo hành).',
                partialMsg: 'Hoàn thiện mệnh đề: "Since this product is still under warranty,".',
                missingMsg: 'Thiếu vế đầu: "Since this product is still under warranty,".'
              },
              {
                label: 'Yêu cầu đổi máy mới hoặc hoàn tiền toàn bộ',
                regex: /\b(replace\s+it\s+with\s+a\s+new\s+one|exchange\s+it)\s+or\s+(give\s+me\s+a\s+full\s+refund|refund\s+my\s+money)\b/i,
                partialRegex: /\b(replace|refund)\b/i,
                goodMsg: 'Nêu rõ 2 phương án giải quyết (replace it with a new one / give me a full refund) rất chuyên nghiệp.',
                partialMsg: 'Hãy kết hợp cả 2 cụm: "replace it with a new one or give me a full refund".',
                missingMsg: 'Thiếu yêu cầu giải quyết: "I would like to request that you replace it with a new one or give me a full refund."'
              }
            ],
            commonErrors: [],
            sample:
              'Since this product is still under warranty, I would like to request that you replace it with a new one or give me a full refund.'
          },
          {
            section: 'Phần 4: Kết thư',
            vn: 'Tôi hy vọng quý vị sẽ xem xét và giải quyết vấn đề này sớm nhất có thể. Tôi rất mong sớm nhận được phản hồi từ quý vị. Trân trọng, Annie.',
            structure:
              'I hope that you will solve this issue as soon as possible. I am looking forward to hearing from you soon. Yours faithfully, Annie.',
            keywords: ['solve this issue', 'as soon as possible', 'looking forward to hearing from you', 'Yours faithfully'],
            clauses: [
              {
                label: 'Hy vọng giải quyết sớm nhất có thể',
                regex: /\bhope\s+(that\s+)?you\s+will\s+(solve|resolve|deal\s+with|handle)\s+this\s+(issue|problem|matter)\s+as\s+soon\s+as\s+possible\b/i,
                partialRegex: /\bas\s+soon\s+as\s+possible\b/i,
                goodMsg: 'Câu thúc giục lịch sự "solve this issue as soon as possible" rất chuẩn.',
                partialMsg: 'Hoàn thiện câu: "I hope that you will solve this issue as soon as possible."',
                missingMsg: 'Thiếu câu: "I hope that you will solve this issue as soon as possible."'
              },
              {
                label: 'Mong nhận phản hồi & Chào kết thư trang trọng',
                regex: /\blook(ing)?\s+forward\s+to\s+hearing\s+from\s+you.*?\byours\s+(faithfully|sincerely)\s*,?\s*annie\b/i,
                partialRegex: /\byours\s+(faithfully|sincerely)\b/i,
                goodMsg: 'Kết thư trang trọng chuẩn mực với "Yours faithfully, Annie."',
                partialMsg: 'Đảm bảo có đủ: "I am looking forward to hearing from you soon. Yours faithfully, Annie."',
                missingMsg: 'Thiếu phần kết thư trang trọng: "I am looking forward to hearing from you soon. Yours faithfully, Annie."'
              }
            ],
            commonErrors: [
              {
                pattern: /\blook(ing)?\s+forward\s+to\s+hear\b/i,
                fix: 'Sau "look forward to" phải dùng V-ing: sửa "hear" thành "hearing".',
                replace: [/\b(look(?:ing)?\s+forward\s+to)\s+hear\b/i, '$1 hearing']
              }
            ],
            sample:
              'I hope that you will solve this issue as soon as possible. I am looking forward to hearing from you soon. Yours faithfully, Annie.'
          }
        ]
      },
      {
        id: 'vstep_b1_email_application',
        type: 'Task 1 • Viết thư (Email)',
        title: '4. Thư ứng tuyển vị trí việc làm (Application Letter)',
        prompt:
          'You saw an advertisement on the internet for a part-time tour guide position. Write an email (at least 120 words) to apply for this job, mentioning your education, work experience, skills, and why you want the job.',
        formulaNote:
          'Dear Sir or Madam → Nêu vị trí ứng tuyển (apply for the position of...) → Học vấn & Kinh nghiệm → Kỹ năng (not only... but also...) → Lý do → Yours sincerely.',
        sentences: [
          {
            section: 'Phần 1: Mở đầu',
            vn: 'Kính gửi Quý Ông/Bà, tôi viết thư này để ứng tuyển vào vị trí hướng dẫn viên du lịch bán thời gian như được đăng tuyển trên trang web của quý công ty.',
            structure:
              'Dear Sir or Madam, I am writing this email to apply for the position of a part-time tour guide as advertised on your website.',
            keywords: ['Dear Sir or Madam', 'apply for the position of', 'part-time tour guide', 'as advertised'],
            clauses: [
              {
                label: 'Lời chào & mục đích ứng tuyển',
                regex: /\bdear\s+sir\s+or\s+madam\s*,\s*(i\s+am|i'm|i’m)\s+writing\s+(this\s+(email|letter)\s+)?to\s+apply\s+for\s+the\s+(position|job|post)\s+of\b/i,
                partialRegex: /\bapply\s+for\b/i,
                goodMsg: 'Mở đầu thư xin việc trang trọng và chuẩn cấu trúc "apply for the position of...".',
                partialMsg: 'Dùng đầy đủ cụm: "Dear Sir or Madam, I am writing this email to apply for the position of...".',
                missingMsg: 'Thiếu mở đầu: "Dear Sir or Madam, I am writing this email to apply for the position of...".'
              },
              {
                label: 'Tên vị trí & nguồn tin tuyển dụng',
                regex: /\bpart-time\s+tour\s+guide\s+as\s+advertised\s+on\s+your\s+website\b/i,
                partialRegex: /\btour\s+guide\b/i,
                goodMsg: 'Cụm "a part-time tour guide as advertised on your website" hoàn toàn chính xác.',
                partialMsg: 'Bổ sung cụm học thuật: "a part-time tour guide as advertised on your website".',
                missingMsg: 'Thiếu vị trí ứng tuyển: "a part-time tour guide as advertised on your website".'
              }
            ],
            commonErrors: [],
            sample:
              'Dear Sir or Madam, I am writing this email to apply for the position of a part-time tour guide as advertised on your website.'
          },
          {
            section: 'Phần 2: Học vấn & Kinh nghiệm',
            vn: 'Trước hết, tôi hiện là sinh viên năm ba tại trường đại học Cần Thơ và tôi đã có hơn hai năm kinh nghiệm làm việc trong lĩnh vực dịch vụ khách hàng.',
            structure:
              'First of all, I am currently a third-year student at Can Tho University, and I have over two years of experience in customer service.',
            keywords: ['First of all', 'third-year student', 'two years of experience', 'customer service'],
            clauses: [
              {
                label: 'Giới thiệu học vấn (sinh viên năm ba)',
                regex: /\b(first\s+of\s+all|firstly)\s*,\s*(i\s+am|i'm|i’m)\s+(currently\s+)?a\s+third-year\s+student\s+at\s+can\s+tho\s+university\b/i,
                partialRegex: /\bstudent\s+at\s+can\s+tho\s+university\b/i,
                goodMsg: 'Giới thiệu học vấn rõ ràng, dùng đúng tính từ ghép "a third-year student".',
                partialMsg: 'Chú ý cụm tính từ ghép chỉ năm học: "a third-year student at Can Tho University".',
                missingMsg: 'Thiếu vế giới thiệu học vấn: "First of all, I am currently a third-year student at Can Tho University".'
              },
              {
                label: 'Kinh nghiệm làm việc trong dịch vụ khách hàng',
                regex: /\bhave\s+(over\s+|more\s+than\s+)?two\s+years\s+of\s+experience\s+in\s+customer\s+service\b/i,
                partialRegex: /\bexperience\s+in\s+customer\s+service\b/i,
                goodMsg: 'Diễn đạt số năm kinh nghiệm ("two years of experience in customer service") rất chuẩn.',
                partialMsg: 'Cấu trúc chuẩn: "and I have over two years of experience in customer service".',
                missingMsg: 'Thiếu vế kinh nghiệm: "and I have over two years of experience in customer service".'
              }
            ],
            commonErrors: [
              {
                pattern: /\b(three|third)\s+years\s+student\b/i,
                fix: 'Khi làm tính từ đứng trước "student", cụm chỉ năm học không thêm "-s": viết là "a third-year student".',
                replace: [/\b(?:three|third)\s+years\s+student\b/i, 'third-year student']
              }
            ],
            sample:
              'First of all, I am currently a third-year student at Can Tho University, and I have over two years of experience in customer service.'
          },
          {
            section: 'Phần 2: Kỹ năng & Thế mạnh',
            vn: 'Thêm vào đó, tôi không chỉ năng động, hòa đồng mà còn giao tiếp tiếng Anh rất trôi chảy, vì vậy tôi có thể làm việc hiệu quả với nhiều người.',
            structure:
              'Besides, I am not only outgoing and sociable, but also good at speaking English fluently; thus, I can work well with many kinds of people.',
            keywords: ['Besides', 'not only', 'but also', 'speaking English fluently'],
            clauses: [
              {
                label: 'Cấu trúc "not only ... but also ..."',
                regex: /\bnot\s+only\s+(outgoing|dynamic|active|energetic)\s+and\s+(sociable|friendly)\s*,?\s*but\s+also\s+(good\s+at\s+)?speak(ing)?\s+english\s+fluently\b/i,
                partialRegex: /\bnot\s+only\b.+\bbut\s+also\b/i,
                goodMsg: 'Sử dụng cấu trúc "not only ... but also ..." rất ấn tượng và đúng ngữ pháp.',
                partialMsg: 'Kiểm tra sự cân xứng hai vế của "not only ... but also ...".',
                missingMsg: 'Hãy áp dụng cấu trúc: "Besides, I am not only outgoing and sociable, but also good at speaking English fluently".'
              },
              {
                label: 'Mệnh đề kết quả (làm việc tốt với nhiều người)',
                regex: /\b(thus|therefore|so)\s*,?\s*i\s+can\s+work\s+(well|effectively)\s+with\s+(many\s+kinds\s+of\s+people|many\s+people|others)\b/i,
                goodMsg: 'Mệnh đề chỉ kết quả mạch lạc, rõ ý.',
                missingMsg: 'Thiếu vế kết quả: "; thus, I can work well with many kinds of people."'
              }
            ],
            commonErrors: [],
            sample:
              'Besides, I am not only outgoing and sociable, but also good at speaking English fluently; thus, I can work well with many kinds of people.'
          },
          {
            section: 'Phần 2: Lý do ứng tuyển',
            vn: 'Lý do tôi muốn ứng tuyển vào vị trí này là vì tôi mong muốn trau dồi kỹ năng giao tiếp và có một công việc ổn định để phụ giúp gia đình.',
            structure:
              'The reason why I would like to apply for this position is that I want to improve my communication skills and have a stable job to support my family.',
            keywords: ['The reason why', 'is that', 'improve my communication skills', 'stable job'],
            clauses: [
              {
                label: 'Cấu trúc "The reason why ... is that ..."',
                regex: /\bthe\s+reason\s+why\s+i\s+(would\s+like\s+to|want\s+to)\s+apply\s+for\s+this\s+(position|job)\s+is\s+that\b/i,
                partialRegex: /\bthe\s+reason\s+why\b/i,
                goodMsg: 'Dùng chuẩn cấu trúc "The reason why S + V is that S + V".',
                partialMsg: 'Chú ý: Sau "The reason why..." phải dùng "is that...", không dùng "is because...".',
                missingMsg: 'Thiếu cấu trúc mở đầu: "The reason why I would like to apply for this position is that...".'
              },
              {
                label: 'Mục tiêu trau dồi kỹ năng & có công việc ổn định',
                regex: /\b(improve|develop|enhance)\s+my\s+communication\s+skills\s+and\s+have\s+a\s+stable\s+job\s+to\s+(help|support)\s+my\s+(parents|family)\b/i,
                partialRegex: /\bcommunication\s+skills\b.*\bstable\s+job\b/i,
                goodMsg: 'Diễn đạt trọn vẹn cả 2 lý do ứng tuyển.',
                partialMsg: 'Hoàn thiện cụm: "I want to improve my communication skills and have a stable job to support my family."',
                missingMsg: 'Thiếu vế sau: "I want to improve my communication skills and have a stable job to support my family."'
              }
            ],
            commonErrors: [
              {
                pattern: /\bthe\s+reason\s+why\b(.+?)\bis\s+because\b/i,
                fix: 'Lỗi lặp ngữ pháp: Đã dùng "The reason why" ở đầu câu thì phía sau phải dùng "is that", KHÔNG dùng "is because".',
                replace: [/\bis\s+because\b/i, 'is that']
              }
            ],
            sample:
              'The reason why I would like to apply for this position is that I want to improve my communication skills and have a stable job to support my family.'
          },
          {
            section: 'Phần 3: Kết thư',
            vn: 'Cảm ơn quý vị đã dành thời gian xem xét hồ sơ của tôi. Tôi rất mong sớm nhận được phản hồi từ quý công ty. Trân trọng, Annie.',
            structure:
              'Thank you for your time and consideration. I look forward to hearing from you soon. Yours sincerely, Annie.',
            keywords: ['Thank you for your time and consideration', 'look forward to hearing from you', 'Yours sincerely'],
            clauses: [
              {
                label: 'Cảm ơn đã dành thời gian xem xét',
                regex: /\bthank\s+you\s+for\s+your\s+time\s+and\s+consideration\b/i,
                partialRegex: /\bthank\s+you\s+for\b/i,
                goodMsg: 'Câu cảm ơn trang trọng chuẩn thư xin việc.',
                partialMsg: 'Gợi ý cụm trang trọng: "Thank you for your time and consideration."',
                missingMsg: 'Thiếu câu cảm ơn: "Thank you for your time and consideration."'
              },
              {
                label: 'Mong nhận phản hồi & ký tên',
                regex: /\blook(ing)?\s+forward\s+to\s+hearing\s+from\s+you\s+soon\s*\.\s*yours\s+(sincerely|faithfully)\s*,?\s*annie\b/i,
                partialRegex: /\blook(ing)?\s+forward\s+to\s+hearing\b/i,
                goodMsg: 'Kết thư xin việc hoàn chỉnh, đúng chuẩn ngữ pháp.',
                partialMsg: 'Đảm bảo có đủ lời chào kết thư: "Yours sincerely, Annie."',
                missingMsg: 'Thiếu câu kết: "I look forward to hearing from you soon. Yours sincerely, Annie."'
              }
            ],
            commonErrors: [],
            sample:
              'Thank you for your time and consideration. I look forward to hearing from you soon. Yours sincerely, Annie.'
          }
        ]
      }
    ],
    B2: [
      {
        id: 'vstep_b2_essay_internet',
        type: 'Task 2 • Viết luận (Benefits & Drawbacks)',
        title: '1. Thuận lợi và Bất lợi của Internet',
        prompt:
          'The Internet has brought about many changes into our day-to-day life. Nowadays we are doing things such as mailing, contacting, banking and communication much faster. Do these developments have more advantages than disadvantages? Write an essay of at least 250 words.',
        formulaNote:
          'Mở bài (Giới thiệu chủ đề + This essay will discuss both merits and demerits) → Thân bài 1 (On the one hand: Merits) → Thân bài 2 (On the other hand: Demerits) → Kết bài.',
        sentences: [
          {
            section: 'Đoạn 1: Mở bài',
            vn: 'Trong kỷ nguyên toàn cầu hóa ngày nay, mạng Internet đang ngày càng trở nên phổ biến và đóng vai trò quan trọng trong đời sống hàng ngày của chúng ta.',
            structure:
              'In the era of globalization, the Internet is becoming more and more popular and plays an important role in our daily lives.',
            keywords: ['In the era of globalization', 'more and more popular', 'plays an important role', 'daily lives'],
            clauses: [
              {
                label: 'Cụm trạng ngữ mở bài học thuật',
                regex: /\bin\s+the\s+era\s+of\s+globalization\b/i,
                goodMsg: 'Dùng cụm mở đầu học thuật "In the era of globalization," rất tốt.',
                missingMsg: 'Thiếu cụm mở đầu: "In the era of globalization,".'
              },
              {
                label: 'Ngày càng phổ biến',
                regex: /\bthe\s+internet\s+(is\s+becoming|tends\s+to\s+become|has\s+become)\s+more\s+and\s+more\s+(popular|common|widespread)\b/i,
                partialRegex: /\bmore\s+and\s+more\s+popular\b/i,
                goodMsg: 'Cấu trúc so sánh kép "more and more popular" chính xác.',
                partialMsg: 'Chú ý động từ trước "more and more popular": dùng "is becoming" hoặc "tends to become".',
                missingMsg: 'Thiếu vế "the Internet is becoming more and more popular".'
              },
              {
                label: 'Đóng vai trò quan trọng trong đời sống hàng ngày',
                regex: /\b(plays|has)\s+an?\s+(important|vital|essential|crucial)\s+(role|part)\s+in\s+our\s+(daily\s+lives|day-to-day\s+life|everyday\s+life)\b/i,
                goodMsg: 'Collocation B2 "plays an important/essential role in our daily lives" chuẩn xác.',
                missingMsg: 'Thiếu vế "and plays an important role in our daily lives".'
              }
            ],
            commonErrors: [
              {
                pattern: /\btends\s+to\s+more\s+and\s+more\s+popular\b/i,
                fix: 'Thiếu động từ nguyên mẫu sau "tends to": Phải viết là "tends to become more and more popular".',
                replace: [/\btends\s+to\s+more\s+and\s+more\s+popular\b/i, 'tends to become more and more popular']
              }
            ],
            sample:
              'In the era of globalization, the Internet is becoming more and more popular and plays an essential role in our daily lives.'
          },
          {
            section: 'Đoạn 1: Mở bài',
            vn: 'Tuy nhiên, tôi giữ niềm tin vững chắc rằng xu hướng này mang lại cả những mặt thuận lợi lẫn bất lợi. Bài tiểu luận này sẽ thảo luận cả ưu điểm và nhược điểm của vấn đề này.',
            structure:
              'However, I hold a firm belief that this trend brings both pros and cons. This essay will discuss both the merits and demerits of using the Internet.',
            keywords: ['However', 'hold a firm belief', 'both pros and cons', 'This essay will discuss', 'merits and demerits'],
            clauses: [
              {
                label: 'Nêu quan điểm có cả mặt lợi và hại',
                regex: /\bhowever\s*,\s*i\s+(hold\s+a\s+firm\s+belief|strongly\s+believe|believe)\s+that\s+this\s+(trend|development)\s+(brings|has)\s+both\s+(pros\s+and\s+cons|advantages\s+and\s+disadvantages|benefits\s+and\s+drawbacks)\b/i,
                partialRegex: /\bboth\s+(pros\s+and\s+cons|advantages\s+and\s+disadvantages)\b/i,
                goodMsg: 'Câu dẫn nhập quan điểm học thuật rất tự nhiên.',
                partialMsg: 'Gợi ý cấu trúc B2: "However, I hold a firm belief that this trend brings both pros and cons."',
                missingMsg: 'Thiếu câu dẫn: "However, I hold a firm belief that this trend brings both pros and cons."'
              },
              {
                label: 'Câu định hướng bài viết (Thesis statement)',
                regex: /\bthis\s+essay\s+will\s+(discuss|examine|analyze)\s+both\s+(the\s+)?(merits\s+and\s+demerits|advantages\s+and\s+disadvantages|benefits\s+and\s+drawbacks)\b/i,
                goodMsg: 'Thesis statement rõ ràng, dùng cặp từ học thuật đồng nghĩa tốt.',
                missingMsg: 'Thiếu câu Thesis statement: "This essay will discuss both the merits and demerits of using the Internet."'
              }
            ],
            commonErrors: [],
            sample:
              'However, I hold a firm belief that this trend brings both pros and cons. This essay will discuss both the merits and demerits of using the Internet.'
          },
          {
            section: 'Đoạn 2: Thân bài 1 (Mặt thuận lợi)',
            vn: 'Một mặt, việc sử dụng Internet có thể mang lại vô số lợi ích to lớn. Thuận lợi đầu tiên là nó là một phương tiện giải trí tuyệt vời.',
            structure:
              'On the one hand, using the Internet can offer tremendous advantages. Firstly, it is a great means of entertainment.',
            keywords: ['On the one hand', 'tremendous advantages', 'Firstly', 'means of entertainment'],
            clauses: [
              {
                label: 'Câu chủ đề đoạn thuận lợi (Topic sentence)',
                regex: /\bon\s+the\s+one\s+hand\s*,\s*using\s+the\s+internet\s+(can\s+)?(offer|bring|provide)\s+(tremendous|many|numerous|great)\s+(advantages|benefits)\b/i,
                partialRegex: /\bon\s+the\s+one\s+hand\b/i,
                goodMsg: 'Câu chủ đề mở đoạn Thân bài 1 chuẩn cấu trúc.',
                partialMsg: 'Hoàn thiện câu chủ đề: "On the one hand, using the Internet can offer tremendous advantages."',
                missingMsg: 'Thiếu câu chủ đề: "On the one hand, using the Internet can offer tremendous advantages."'
              },
              {
                label: 'Luận điểm 1: Phương tiện giải trí tuyệt vời',
                regex: /\b(firstly|first\s+of\s+all|the\s+first\s+advantage\s+is\s+that)\s*,?\s*(it\s+is\s+a\s+(great|wonderful|good)\s+means\s+of\s+entertainment)\b/i,
                partialRegex: /\bmeans\s+of\s+entertainment\b/i,
                goodMsg: 'Dùng chuẩn cụm danh từ B2 "a great means of entertainment".',
                partialMsg: 'Hãy mở đầu luận điểm 1 bằng "Firstly, it is a great means of entertainment."',
                missingMsg: 'Thiếu luận điểm 1: "Firstly, it is a great means of entertainment."'
              }
            ],
            commonErrors: [],
            sample:
              'On the one hand, using the Internet can offer tremendous advantages. Firstly, it is a great means of entertainment.'
          },
          {
            section: 'Đoạn 2: Thân bài 1 (Giải thích & Kết quả)',
            vn: 'Nói cách khác, mọi người có xu hướng nghe nhạc, chơi trò chơi trực tuyến hoặc xem các video giải trí; nhờ vậy, họ có thể thư giãn sau giờ học và có thêm năng lượng tích cực để làm việc hiệu quả.',
            structure:
              'In other words, people tend to listen to music, play online games, or watch entertaining videos; thus, they can unwind after school and have more positive energy to work effectively.',
            keywords: ['In other words', 'tend to', 'thus', 'unwind', 'positive energy'],
            clauses: [
              {
                label: 'Mệnh đề giải thích (In other words, people tend to...)',
                regex: /\bin\s+other\s+words\s*,\s*people\s+tend\s+to\s+listen\s+to\s+music\s*,\s*play\s+online\s+games\s*,?\s*or\s+watch\b/i,
                partialRegex: /\bpeople\s+tend\s+to\b/i,
                goodMsg: 'Triển khai câu giải thích bằng "In other words, people tend to + V0..." rất mạch lạc.',
                partialMsg: 'Chú ý cấu trúc song song sau "tend to": "listen to music, play online games, or watch entertaining videos".',
                missingMsg: 'Thiếu vế giải thích: "In other words, people tend to listen to music, play online games, or watch entertaining videos".'
              },
              {
                label: 'Mệnh đề kết quả (; thus, they can unwind...)',
                regex: /\b(thus|therefore|as\s+a\s+result)\s*,\s*they\s+can\s+(unwind|relax)\s+after\s+(school|work)\s+and\s+have\s+more\s+positive\s+energy\s+to\s+work\s+effectively\b/i,
                partialRegex: /\b(unwind|relax)\b.*\bwork\s+effectively\b/i,
                goodMsg: 'Dùng từ vựng B2 "unwind", "positive energy" và trạng từ "effectively" rất tốt.',
                partialMsg: 'Nối vế kết quả bằng "; thus, they can unwind after school and have more positive energy to work effectively."',
                missingMsg: 'Thiếu vế kết quả: "; thus, they can unwind after school and have more positive energy to work effectively."'
              }
            ],
            commonErrors: [],
            sample:
              'In other words, people tend to listen to music, play online games, or watch entertaining videos; thus, they can unwind after school and have more positive energy to work effectively.'
          },
          {
            section: 'Đoạn 2: Thân bài 1 (Thuận lợi 2 + Ví dụ)',
            vn: 'Thứ hai, Internet là một nguồn thông tin khổng lồ. Điều này có nghĩa là con người có khả năng tìm kiếm thông tin giá trị cho công việc và học tập. Ví dụ, nếu người dùng muốn cải thiện kỹ năng tiếng Anh, họ có thể xem hàng loạt video trên YouTube hoàn toàn miễn phí.',
            structure:
              'Secondly, the Internet is a great source of information. It means that people are capable of seeking valuable information for their work and study. For example, if users want to boost their English skills, they can watch videos on YouTube for free.',
            keywords: ['Secondly', 'source of information', 'capable of seeking', 'For example', 'for free'],
            clauses: [
              {
                label: 'Luận điểm 2: Nguồn thông tin lớn',
                regex: /\bsecondly\s*,\s*the\s+internet\s+is\s+a\s+(great|huge|vast|massive)\s+source\s+of\s+information\b/i,
                goodMsg: 'Nêu luận điểm 2 rõ ràng, chuẩn xác.',
                missingMsg: 'Thiếu câu nêu luận điểm 2: "Secondly, the Internet is a great source of information."'
              },
              {
                label: 'Giải thích (capable of seeking valuable information)',
                regex: /\bit\s+means\s+that\s+people\s+(are\s+capable\s+of\s+seeking|can\s+seek|can\s+find)\s+valuable\s+information\b/i,
                goodMsg: 'Dùng cấu trúc B2 "are capable of + V-ing (seeking)" rất chuẩn.',
                missingMsg: 'Thiếu câu giải thích: "It means that people are capable of seeking valuable information for their work and study."'
              },
              {
                label: 'Dẫn chứng ví dụ cụ thể (For example, if...)',
                regex: /\bfor\s+(example|instance)\s*,\s*if\s+(internet\s+)?users\s+want\s+to\s+(boost|improve)\s+their\s+english\s+skills\s*,\s*they\s+can\s+watch\s+videos\s+on\s+youtube\s+for\s+free\b/i,
                partialRegex: /\bfor\s+(example|instance)\b.*\byoutube\b/i,
                goodMsg: 'Câu ví dụ dùng câu điều kiện loại 1 hoàn chỉnh và thuyết phục.',
                partialMsg: 'Hoàn thiện câu ví dụ: "For example, if users want to boost their English skills, they can watch videos on YouTube for free."',
                missingMsg: 'Thiếu câu ví dụ: "For example, if users want to boost their English skills, they can watch videos on YouTube for free."'
              }
            ],
            commonErrors: [],
            sample:
              'Secondly, the Internet is a great source of information. It means that people are capable of seeking valuable information for their work and study. For example, if Internet users want to boost their English skills, they can watch videos on YouTube for free.'
          },
          {
            section: 'Đoạn 3: Thân bài 2 (Mặt bất lợi)',
            vn: 'Mặt khác, có một số bất lợi rõ ràng của việc sử dụng Internet. Trước hết, nó có thể gây ra nhiều vấn đề đối với sự tương tác xã hội ngoài đời thực.',
            structure:
              'On the other hand, there are several obvious disadvantages of using the Internet. First of all, it may cause several problems with social interaction.',
            keywords: ['On the other hand', 'obvious disadvantages', 'First of all', 'social interaction'],
            clauses: [
              {
                label: 'Chuyển đoạn sang mặt bất lợi (On the other hand)',
                regex: /\bon\s+the\s+other\s+hand\s*,\s*there\s+are\s+(several|some)\s+(obvious\s+|clear\s+)?(disadvantages|drawbacks)\s+of\s+using\s+the\s+internet\b/i,
                partialRegex: /\bon\s+the\s+other\s+hand\b/i,
                goodMsg: 'Chuyển đoạn tương phản bằng "On the other hand," rất mạch lạc.',
                partialMsg: 'Hoàn thiện câu chủ đề đoạn 2: "On the other hand, there are several obvious disadvantages of using the Internet."',
                missingMsg: 'Thiếu câu chủ đề đoạn bất lợi: "On the other hand, there are several obvious disadvantages of using the Internet."'
              },
              {
                label: 'Bất lợi 1: Gây vấn đề về tương tác xã hội',
                regex: /\b(first\s+of\s+all|firstly)\s*,\s*(it|the\s+internet)\s+(may|can|might)\s+cause\s+(several|many|some)\s+problems\s+with\s+social\s+interaction\b/i,
                partialRegex: /\bsocial\s+interaction\b/i,
                goodMsg: 'Nêu bất lợi thứ nhất với cụm "social interaction" chính xác.',
                partialMsg: 'Viết trọn câu: "First of all, it may cause several problems with social interaction."',
                missingMsg: 'Thiếu câu bất lợi 1: "First of all, it may cause several problems with social interaction."'
              }
            ],
            commonErrors: [],
            sample:
              'On the other hand, there are several obvious disadvantages of using the Internet. First of all, the Internet may cause several problems with social interaction.'
          },
          {
            section: 'Đoạn 3: Thân bài 2 (Giải thích + Bất lợi 2)',
            vn: 'Nhiều người thích lướt Facebook hơn là gặp gỡ bạn bè; kết quả là điều này làm giảm sự tự tin khi giao tiếp trước đám đông. Thứ hai, lướt mạng rất tốn thời gian vì nhiều học sinh mải chơi game đến mức không còn đủ thời gian học tập.',
            structure:
              'More people prefer surfing Facebook instead of meeting friends; as a result, it could decrease their confidence in public. Secondly, using the Internet is time-consuming because many students spend too much time playing online games instead of studying.',
            keywords: ['prefer surfing', 'instead of', 'as a result', 'time-consuming'],
            clauses: [
              {
                label: 'Giải thích hệ quả giảm tự tin giao tiếp',
                regex: /\bprefer\s+surfing\s+facebook\s+instead\s+of\s+meeting\s+friends\s*;\s*as\s+a\s+result\s*,\s*it\s+(could|can|may)\s+(decrease|reduce)\s+their\s+confidence/i,
                partialRegex: /\binstead\s+of\s+meeting\s+friends\b/i,
                goodMsg: 'Giải thích nguyên nhân - hệ quả rõ ràng, dùng đúng cấu trúc "instead of + V-ing".',
                partialMsg: 'Chú ý sau "prefer" và "instead of" đều dùng V-ing: "prefer surfing Facebook instead of meeting friends".',
                missingMsg: 'Thiếu câu giải thích: "More people prefer surfing Facebook instead of meeting friends; as a result, it could decrease their confidence in public."'
              },
              {
                label: 'Bất lợi 2: Tốn thời gian (time-consuming)',
                regex: /\bsecondly\s*,\s*using\s+the\s+internet\s+is\s+time-consuming\s+because\s+many\s+students\s+spend\s+too\s+much\s+time\s+playing\s+online\s+games\s+instead\s+of\s+studying\b/i,
                partialRegex: /\btime-consuming\b/i,
                goodMsg: 'Sử dụng tính từ ghép B2 "time-consuming" và cấu trúc "spend time + V-ing" chính xác.',
                partialMsg: 'Hoàn thiện câu thứ 2: "Secondly, using the Internet is time-consuming because many students spend too much time playing online games instead of studying."',
                missingMsg: 'Thiếu ý bất lợi 2: "Secondly, using the Internet is time-consuming because many students spend too much time playing online games instead of studying."'
              }
            ],
            commonErrors: [],
            sample:
              'More people prefer surfing Facebook instead of meeting friends; as a result, it could decrease their confidence to speak in public. Secondly, using the Internet is time-consuming because many students spend too much time playing online games instead of studying.'
          },
          {
            section: 'Đoạn 4: Kết bài',
            vn: 'Tóm lại, việc sử dụng Internet có cả lợi ích lẫn tác hại. Mặc dù nó có một vài nhược điểm, tôi tin chắc rằng chúng ta nên học cách tối đa hóa mặt tích cực cũng như giảm thiểu mặt tiêu cực.',
            structure:
              'To sum up, there are both benefits and drawbacks of using the Internet. Although it has some disadvantages, I am convinced that we should learn how to maximize the advantages as well as minimize the disadvantages.',
            keywords: ['To sum up', 'both benefits and drawbacks', 'Although', 'maximize', 'minimize'],
            clauses: [
              {
                label: 'Tóm tắt lại 2 mặt của vấn đề',
                regex: /\b(to\s+sum\s+up|in\s+conclusion)\s*,\s*there\s+are\s+both\s+(benefits\s+and\s+drawbacks|advantages\s+and\s+disadvantages|pros\s+and\s+cons)\s+of\s+using\s+the\s+internet\b/i,
                partialRegex: /\b(to\s+sum\s+up|in\s+conclusion)\b/i,
                goodMsg: 'Mở đầu kết bài chuẩn xác.',
                partialMsg: 'Viết đủ câu đầu kết bài: "To sum up, there are both benefits and drawbacks of using the Internet."',
                missingMsg: 'Thiếu câu mở đầu kết bài: "To sum up, there are both benefits and drawbacks of using the Internet."'
              },
              {
                label: 'Mệnh đề nhượng bộ (Although...) & Khẳng định giải pháp',
                regex: /\balthough\s+(it|the\s+internet)\s+has\s+some\s+(disadvantages|drawbacks)\s*,\s*i\s+(am\s+convinced|believe)\s+that\s+we\s+should\s+learn\s+how\s+to\s+maximize\s+the\s+(advantages|benefits)\s+as\s+well\s+as\s+minimize\s+the\s+(disadvantages|drawbacks)\b/i,
                partialRegex: /\bmaximize\b.*\bminimize\b/i,
                goodMsg: 'Cấu trúc "Although..., I am convinced that..." và cặp từ "maximize ... minimize ..." đạt chuẩn B2.',
                partialMsg: 'Đảm bảo có động từ "learn" trước "how to maximize": "we should learn how to maximize the advantages as well as minimize the disadvantages".',
                missingMsg: 'Thiếu câu chốt bài: "Although it has some disadvantages, I am convinced that we should learn how to maximize the advantages as well as minimize the disadvantages."'
              }
            ],
            commonErrors: [
              {
                pattern: /\balthough\b[^.!?]+?\bbut\b/i,
                fix: 'Lỗi thừa liên từ: Trong tiếng Anh đã dùng "Although" ở mệnh đề đầu thì KHÔNG dùng "but" ở mệnh đề sau.',
                replace: [/\b(although\b[^,]+,\s*)but\s+/i, '$1']
              },
              {
                pattern: /\bwe\s+should\s+how\s+to\b/i,
                fix: 'Thiếu động từ nguyên mẫu sau "should": Sửa thành "we should learn how to...".',
                replace: [/\bwe\s+should\s+how\s+to\b/i, 'we should learn how to']
              }
            ],
            sample:
              'To sum up, there are both benefits and drawbacks of using the Internet. Although the Internet has some disadvantages, I am convinced that we should learn how to maximize the advantages as well as minimize the disadvantages.'
          }
        ]
      },
      {
        id: 'vstep_b2_essay_braindrain',
        type: 'Task 2 • Viết luận (Causes & Solutions)',
        title: '2. Vấn đề Chảy máu chất xám (Brain Drain)',
        prompt:
          'An increasing number of professionals, such as doctors and teachers, are leaving their own poorer countries to work in developed countries. What are the reasons behind this trend? What solutions can you suggest to deal with this situation? Write at least 250 words.',
        formulaNote:
          'Mở bài (Giới thiệu Brain drain + Thesis) → Thân bài 1 (Nguyên nhân: Điều kiện làm việc & Lương thấp) → Thân bài 2 (Giải pháp: Chính phủ & Doanh nghiệp) → Kết bài.',
        sentences: [
          {
            section: 'Đoạn 1: Mở bài',
            vn: 'Thế giới đã thay đổi rất nhiều, tuy nhiên một số vấn đề tiêu cực đã xuất hiện mà một trong số đó là tình trạng chảy máu chất xám. Bài viết này sẽ thảo luận các nguyên nhân chính của hiện tượng chảy máu chất xám và đề xuất một số giải pháp để cải thiện tình hình.',
            structure:
              'The world has changed a lot; nonetheless, brain drain has become a serious problem. This essay will discuss the main causes of brain drain and suggest some solutions to improve the situation.',
            keywords: ['brain drain', 'This essay will discuss', 'main causes', 'suggest some solutions'],
            clauses: [
              {
                label: 'Giới thiệu vấn đề chảy máu chất xám (brain drain)',
                regex: /\bbrain\s+drain\s+has\s+become\s+a\s+(serious|major|pressing)\s+(problem|issue)\b/i,
                partialRegex: /\bbrain\s+drain\b/i,
                goodMsg: 'Giới thiệu đúng thuật ngữ trọng tâm "brain drain".',
                partialMsg: 'Gợi ý câu mở đầu: "The world has changed a lot; nonetheless, brain drain has become a serious problem."',
                missingMsg: 'Thiếu câu giới thiệu chủ đề có cụm "brain drain" (chảy máu chất xám).'
              },
              {
                label: 'Câu định hướng thảo luận nguyên nhân & giải pháp',
                regex: /\bthis\s+essay\s+will\s+discuss\s+the\s+(main\s+)?(causes|reasons)\b.*\band\s+(suggest|propose)\s+some\s+(solutions|measures)\b/i,
                goodMsg: 'Câu Thesis statement nêu rõ 2 nhiệm vụ của bài (causes & solutions).',
                missingMsg: 'Thiếu câu định hướng: "This essay will discuss the main causes of brain drain and suggest some solutions to improve the situation."'
              }
            ],
            commonErrors: [],
            sample:
              'The world has changed a lot; nonetheless, brain drain has become a serious problem. This essay will discuss the main causes of brain drain and suggest some solutions to improve the situation.'
          },
          {
            section: 'Đoạn 2: Thân bài 1 (Nguyên nhân 1)',
            vn: 'Có một số nguyên nhân chính dẫn đến tình trạng chảy máu chất xám ở các nước đang phát triển. Nguyên nhân đầu tiên là điều kiện làm việc còn thiếu thốn vì nhiều cơ sở thiếu trang thiết bị và máy móc hiện đại.',
            structure:
              'There are several major reasons why brain drain happens in developing countries. The first cause is poor working conditions because many companies lack modern machines and equipment.',
            keywords: ['major reasons', 'developing countries', 'poor working conditions', 'lack modern machines'],
            clauses: [
              {
                label: 'Câu chủ đề đoạn nguyên nhân',
                regex: /\bthere\s+are\s+(several|some|many)\s+(major\s+|main\s+)?(reasons|causes)\s+why\s+brain\s+drain\s+(happens|occurs)\s+in\s+developing\s+countries\b/i,
                partialRegex: /\bdeveloping\s+countries\b/i,
                goodMsg: 'Câu chủ đề đoạn Nguyên nhân chuẩn xác.',
                partialMsg: 'Viết đủ câu chủ đề: "There are several major reasons why brain drain happens in developing countries."',
                missingMsg: 'Thiếu câu chủ đề: "There are several major reasons why brain drain happens in developing countries."'
              },
              {
                label: 'Nguyên nhân 1: Điều kiện làm việc thiếu thốn',
                regex: /\b(the\s+first\s+cause|firstly)\b.*\bpoor\s+working\s+conditions\s+because\s+many\s+(companies|hospitals|places)\s+lack\s+modern\s+(machines|facilities)\s+and\s+equipment\b/i,
                partialRegex: /\bworking\s+conditions\b/i,
                goodMsg: 'Nêu và giải thích nguyên nhân 1 ("poor working conditions", "lack modern machines and equipment") rất chuẩn.',
                partialMsg: 'Chú ý động từ "lack" không đi với "of" và danh từ "equipment" không đếm được.',
                missingMsg: 'Thiếu nguyên nhân 1: "The first cause is poor working conditions because many companies lack modern machines and equipment."'
              }
            ],
            commonErrors: [
              {
                pattern: /\black\s+of\s+modern\b/i,
                fix: 'Khi "lack" đóng vai trò là động từ ("companies lack modern machines") thì KHÔNG đi với giới từ "of".',
                replace: [/\black\s+of\s+modern\b/i, 'lack modern']
              },
              {
                pattern: /\bequipments\b/i,
                fix: 'Lỗi danh từ không đếm được: "equipment" (trang thiết bị) không bao giờ thêm "-s".',
                replace: [/\bequipments\b/i, 'equipment']
              }
            ],
            sample:
              'There are several major reasons why brain drain happens in developing countries. The first cause is poor working conditions because many companies lack modern machines and equipment.'
          },
          {
            section: 'Đoạn 2: Thân bài 1 (Nguyên nhân 2)',
            vn: 'Một nguyên nhân lớn khác là mức thu nhập thấp. Ví dụ, nhiều trí thức trẻ được trả lương rất cao ở các nước phát triển trong khi thu nhập ở quê nhà lại không đủ để trang trải cuộc sống gia đình.',
            structure:
              'Another major cause is low income. For example, many young professionals are offered high salaries in developed countries while their income in their home country is not enough to support their families.',
            keywords: ['Another major cause', 'low income', 'high salaries', 'developed countries'],
            clauses: [
              {
                label: 'Nguyên nhân 2: Thu nhập thấp (low income)',
                regex: /\b(another\s+(major\s+|main\s+)?(cause|reason)|secondly)\s+is\s+(low\s+income|low\s+salary|low\s+salaries)\b/i,
                partialRegex: /\blow\s+(income|salary|salaries)\b/i,
                goodMsg: 'Nêu nguyên nhân thứ 2 ngắn gọn, súc tích.',
                partialMsg: 'Mở đầu bằng: "Another major cause is low income."',
                missingMsg: 'Thiếu câu nêu nguyên nhân 2: "Another major cause is low income."'
              },
              {
                label: 'Ví dụ so sánh mức lương ở nước phát triển và quê nhà',
                regex: /\bfor\s+(example|instance)\s*,.*\b(high\s+salaries|well-paid)\s+in\s+developed\s+countries\s+while\b/i,
                partialRegex: /\bdeveloped\s+countries\b/i,
                goodMsg: 'Câu ví dụ đối chiếu bằng liên từ "while" rất thuyết phục.',
                partialMsg: 'Hoàn thiện câu ví dụ: "For example, many young professionals are offered high salaries in developed countries while their income in their home country is not enough to support their families."',
                missingMsg: 'Thiếu câu ví dụ: "For example, many young professionals are offered high salaries in developed countries while their income in their home country is not enough to support their families."'
              }
            ],
            commonErrors: [],
            sample:
              'Another major cause is low income. For example, many young professionals are offered high salaries in developed countries while their income in their home country is not enough to support their families.'
          },
          {
            section: 'Đoạn 3: Thân bài 2 (Giải pháp)',
            vn: 'Để giải quyết vấn đề nghiêm trọng này, chính phủ và các doanh nghiệp nên thực hiện một số giải pháp thiết thực. Trước hết, nhà nước nên đầu tư nhiều tiền hơn vào việc nâng cấp cơ sở vật chất tại các bệnh viện và trường học.',
            structure:
              'To tackle this serious problem, the government and companies should take some practical solutions. First of all, the government should invest more money in upgrading facilities in hospitals and schools.',
            keywords: ['To tackle this serious problem', 'practical solutions', 'invest more money in upgrading'],
            clauses: [
              {
                label: 'Câu chủ đề đoạn Giải pháp',
                regex: /\bto\s+(tackle|solve|address|deal\s+with)\s+this\s+(serious\s+)?problem\s*,\s*the\s+government\s+and\s+companies\s+should\b/i,
                partialRegex: /\bthe\s+government\b.*\bsolutions\b/i,
                goodMsg: 'Câu chuyển đoạn sang phần Giải pháp rất rõ ràng.',
                partialMsg: 'Mở đầu đoạn bằng: "To tackle this serious problem, the government and companies should take some practical solutions."',
                missingMsg: 'Thiếu câu chủ đề giải pháp: "To tackle this serious problem, the government and companies should take some practical solutions."'
              },
              {
                label: 'Giải pháp 1: Đầu tư nâng cấp cơ sở vật chất (invest in + V-ing)',
                regex: /\binvest\s+more\s+(money|funds|budget)\s+in\s+(upgrading|improving|modernizing)\s+facilities\b/i,
                partialRegex: /\binvest\b.*\bfacilities\b/i,
                goodMsg: 'Dùng chuẩn cấu trúc "invest money in + V-ing (upgrading facilities)".',
                partialMsg: 'Chú ý sau "invest money in" động từ thêm "-ing": "invest more money in upgrading facilities in hospitals and schools".',
                missingMsg: 'Thiếu giải pháp 1: "First of all, the government should invest more money in upgrading facilities in hospitals and schools."'
              }
            ],
            commonErrors: [],
            sample:
              'To tackle this serious problem, the government and companies should take some practical solutions. First of all, the government should invest more money in upgrading facilities in hospitals and schools.'
          },
          {
            section: 'Đoạn 3: Thân bài 2 (Giải pháp 2) & Kết bài',
            vn: 'Thứ hai, các công ty nên đưa ra mức lương hấp dẫn hơn và chính sách đãi ngộ tốt để thu hút nhân tài. Tóm lại, chảy máu chất xám là một vấn đề lớn, nhưng nếu các giải pháp trên được áp dụng hiệu quả thì tình hình sẽ sớm được cải thiện.',
            structure:
              'Secondly, companies should offer more attractive salaries and good policies to attract talented people. In conclusion, brain drain is a big issue, but if the solutions above are applied effectively, the situation will be better soon.',
            keywords: ['attractive salaries', 'attract talented people', 'In conclusion', 'solutions above are applied'],
            clauses: [
              {
                label: 'Giải pháp 2: Lương hấp dẫn để thu hút nhân tài',
                regex: /\bsecondly\s*,\s*companies\s+should\s+(offer|provide|give)\s+(more\s+)?attractive\s+salaries.*?\bto\s+(attract|keep|retain)\s+talented\s+(people|workers|professionals)\b/i,
                partialRegex: /\battractive\s+salaries\b/i,
                goodMsg: 'Giải pháp thứ 2 diễn đạt tự nhiên, chuẩn xác.',
                partialMsg: 'Hoàn thiện câu: "Secondly, companies should offer more attractive salaries and good policies to attract talented people."',
                missingMsg: 'Thiếu giải pháp 2: "Secondly, companies should offer more attractive salaries and good policies to attract talented people."'
              },
              {
                label: 'Câu kết bài tổng kết & giả định kết quả tích cực',
                regex: /\b(in\s+conclusion|to\s+sum\s+up)\s*,.*?\bif\s+the\s+solutions\s+above\s+are\s+applied\b/i,
                partialRegex: /\b(in\s+conclusion|to\s+sum\s+up)\b/i,
                goodMsg: 'Câu kết bài dùng câu điều kiện bị động "if the solutions above are applied" rất chuẩn B2.',
                partialMsg: 'Gợi ý câu chốt: "In conclusion, brain drain is a big issue, but if the solutions above are applied effectively, the situation will be better soon."',
                missingMsg: 'Thiếu câu kết bài: "In conclusion, brain drain is a big issue, but if the solutions above are applied effectively, the situation will be better soon."'
              }
            ],
            commonErrors: [],
            sample:
              'Secondly, companies should offer more attractive salaries and good policies to attract talented people. In conclusion, brain drain is a big issue, but if the solutions above are applied effectively, the situation will be better soon.'
          }
        ]
      },
      {
        id: 'vstep_b2_essay_deforestation',
        type: 'Task 2 • Viết luận (Causes & Effects / Solutions)',
        title: '3. Nạn phá rừng (Deforestation) & Bảo vệ môi trường',
        prompt:
          'Deforestation is happening in many parts of the world, with serious results for the environment. What are the causes of deforestation and what solutions can be taken to solve this problem? Write an essay of at least 250 words.',
        formulaNote:
          'Mở bài (Deforestation + Thesis) → Thân bài 1 (Nguyên nhân: Lấy gỗ, mở rộng đất nông nghiệp) → Thân bài 2 (Giải pháp: Luật nghiêm & Trồng cây) → Kết bài.',
        sentences: [
          {
            section: 'Đoạn 1: Mở bài',
            vn: 'Ngày nay, nạn phá rừng đang diễn ra ở nhiều nơi trên thế giới và gây ra những hậu quả nghiêm trọng đối với môi trường tự nhiên. Bài luận này sẽ phân tích các nguyên nhân chính của vấn đề này và đề xuất một số giải pháp khả thi.',
            structure:
              'Nowadays, deforestation is happening in many parts of the world and causing serious consequences for the natural environment. This essay will analyze the main causes of this problem and suggest some feasible solutions.',
            keywords: ['deforestation', 'serious consequences', 'natural environment', 'feasible solutions'],
            clauses: [
              {
                label: 'Giới thiệu thực trạng nạn phá rừng',
                regex: /\bdeforestation\s+is\s+(happening|occurring|taking\s+place)\s+in\s+many\s+parts\s+of\s+the\s+world\b/i,
                partialRegex: /\bdeforestation\b/i,
                goodMsg: 'Mở đầu giới thiệu chủ đề "deforestation" chuẩn xác.',
                partialMsg: 'Hoàn thiện câu đầu: "Nowadays, deforestation is happening in many parts of the world and causing serious consequences for the natural environment."',
                missingMsg: 'Thiếu câu giới thiệu nạn phá rừng (deforestation).'
              },
              {
                label: 'Câu định hướng bài viết (Thesis statement)',
                regex: /\bthis\s+essay\s+will\s+(analyze|discuss|examine)\s+the\s+(main\s+)?causes.*?\band\s+(suggest|propose)\s+some\s+(feasible\s+|practical\s+)?solutions\b/i,
                goodMsg: 'Câu Thesis statement chuẩn mực, dùng tính từ B2 "feasible solutions" rất tốt.',
                missingMsg: 'Thiếu câu Thesis statement: "This essay will analyze the main causes of this problem and suggest some feasible solutions."'
              }
            ],
            commonErrors: [],
            sample:
              'Nowadays, deforestation is happening in many parts of the world and causing serious consequences for the natural environment. This essay will analyze the main causes of this problem and suggest some feasible solutions.'
          },
          {
            section: 'Đoạn 2: Thân bài 1 (Nguyên nhân)',
            vn: 'Có hai nguyên nhân chính dẫn đến việc chặt phá rừng. Nguyên nhân đầu tiên là người dân chặt cây để lấy gỗ làm nhà và lấy thêm đất cho sản xuất nông nghiệp.',
            structure:
              'There are two main causes leading to deforestation. Firstly, people cut down trees to get wood for building houses and have more land for agriculture.',
            keywords: ['main causes', 'cut down trees', 'building houses', 'agriculture'],
            clauses: [
              {
                label: 'Câu chủ đề nêu nguyên nhân phá rừng',
                regex: /\bthere\s+are\s+(two|several|some)\s+(main|major)\s+(causes|reasons)\s+(leading\s+to|of)\s+deforestation\b/i,
                goodMsg: 'Câu chủ đề ngắn gọn, đi thẳng vào trọng tâm.',
                missingMsg: 'Thiếu câu chủ đề: "There are two main causes leading to deforestation."'
              },
              {
                label: 'Nguyên nhân 1: Chặt cây lấy gỗ và đất nông nghiệp',
                regex: /\bcut\s+down\s+trees\s+to\s+get\s+(wood|timber)\b.*\b(land\s+for\s+agriculture|agricultural\s+land)\b/i,
                partialRegex: /\bcut\s+down\s+trees\b/i,
                goodMsg: 'Diễn đạt rõ ràng mục đích chặt cây ("cut down trees to get wood... and have more land for agriculture").',
                partialMsg: 'Bổ sung đầy đủ ý: "cut down trees to get wood for building houses and have more land for agriculture".',
                missingMsg: 'Thiếu ý: "Firstly, people cut down trees to get wood for building houses and have more land for agriculture."'
              }
            ],
            commonErrors: [],
            sample:
              'There are two main causes leading to deforestation. Firstly, people cut down trees to get wood for building houses and have more land for agriculture.'
          },
          {
            section: 'Đoạn 2: Thân bài 1 (Nguyên nhân 2 & Hậu quả)',
            vn: 'Thứ hai, sự gia tăng dân số nhanh chóng đòi hỏi nhiều khu dân cư hơn; kết quả là nhiều cánh rừng bị tàn phá nghiêm trọng, dẫn đến biến đổi khí hậu và lũ lụt.',
            structure:
              'Secondly, rapid population growth requires more residential areas; as a result, many forests are seriously destroyed, leading to climate change and floods.',
            keywords: ['rapid population growth', 'as a result', 'seriously destroyed', 'climate change'],
            clauses: [
              {
                label: 'Nguyên nhân 2: Gia tăng dân số nhanh',
                regex: /\bsecondly\s*,\s*(rapid\s+)?population\s+growth\s+(requires|needs|demands)\b/i,
                partialRegex: /\bpopulation\s+growth\b/i,
                goodMsg: 'Cụm danh từ học thuật "rapid population growth" dùng rất chuẩn.',
                partialMsg: 'Mở đầu bằng: "Secondly, rapid population growth requires more residential areas".',
                missingMsg: 'Thiếu ý nguyên nhân 2: "Secondly, rapid population growth requires more residential areas".'
              },
              {
                label: 'Hậu quả: Rừng bị tàn phá, gây biến đổi khí hậu & lũ lụt',
                regex: /\bforests\s+are\s+(seriously\s+|heavily\s+)?destroyed\s*,\s*(leading\s+to|causing)\s+climate\s+change\s+and\s+floods\b/i,
                partialRegex: /\bclimate\s+change\b/i,
                goodMsg: 'Dùng cấu trúc bị động "forests are destroyed" và mệnh đề phân từ "leading to climate change and floods" rất hay.',
                partialMsg: 'Hoàn thiện vế kết quả: "; as a result, many forests are seriously destroyed, leading to climate change and floods."',
                missingMsg: 'Thiếu vế kết quả: "; as a result, many forests are seriously destroyed, leading to climate change and floods."'
              }
            ],
            commonErrors: [],
            sample:
              'Secondly, rapid population growth requires more residential areas; as a result, many forests are seriously destroyed, leading to climate change and floods.'
          },
          {
            section: 'Đoạn 3: Thân bài 2 (Giải pháp) & Kết bài',
            vn: 'Để giải quyết vấn đề này, chính phủ cần ban hành các đạo luật nghiêm khắc để xử phạt những kẻ chặt phá rừng trái phép. Đồng thời, mỗi người dân nên tích cực tham gia các chiến dịch trồng cây gây rừng. Tóm lại, bảo vệ rừng là trách nhiệm chung của toàn nhân loại.',
            structure:
              'To solve this problem, the government should enact strict laws to punish illegal loggers. Besides, citizens should actively take part in tree-planting campaigns. In conclusion, protecting forests is the shared responsibility of all human beings.',
            keywords: ['enact strict laws', 'illegal loggers', 'tree-planting campaigns', 'In conclusion'],
            clauses: [
              {
                label: 'Giải pháp từ chính phủ: Ban hành luật nghiêm khắc',
                regex: /\b(the\s+government\s+should\s+(enact|pass|introduce)\s+strict\s+laws\s+to\s+punish)\b/i,
                partialRegex: /\bstrict\s+laws\b/i,
                goodMsg: 'Cụm collocation B2 "enact strict laws to punish illegal loggers" rất xuất sắc.',
                partialMsg: 'Gợi ý cụm chuẩn: "the government should enact strict laws to punish illegal loggers".',
                missingMsg: 'Thiếu giải pháp của chính phủ: "To solve this problem, the government should enact strict laws to punish illegal loggers."'
              },
              {
                label: 'Giải pháp từ người dân & Kết bài',
                regex: /\b(take\s+part\s+in|participate\s+in|join)\s+tree-planting\s+campaigns.*?\b(in\s+conclusion|to\s+sum\s+up)\b/i,
                partialRegex: /\b(tree-planting|protecting\s+forests)\b/i,
                goodMsg: 'Kết hợp giải pháp trồng cây và câu kết luận rất trọn vẹn.',
                partialMsg: 'Đảm bảo có cả ý "take part in tree-planting campaigns" và câu kết "In conclusion, protecting forests is the shared responsibility of all human beings."',
                missingMsg: 'Thiếu phần giải pháp cá nhân & kết luận.'
              }
            ],
            commonErrors: [],
            sample:
              'To solve this problem, the government should enact strict laws to punish illegal loggers. Besides, citizens should actively take part in tree-planting campaigns. In conclusion, protecting forests is the shared responsibility of all human beings.'
          }
        ]
      },
      {
        id: 'vstep_b2_essay_airpollution',
        type: 'Task 2 • Viết luận (Causes & Solutions)',
        title: '4. Ô nhiễm không khí tại các thành phố lớn (Air Pollution)',
        prompt:
          'Air pollution is becoming an increasingly serious problem in many big cities around the world. What are the main causes of air pollution, and what measures can be taken to tackle this issue? Write an essay of at least 250 words.',
        formulaNote:
          'Mở bài (Air pollution + Thesis) → Thân bài 1 (Nguyên nhân: Khí thải xe cộ & Nhà máy công nghiệp) → Thân bài 2 (Giải pháp: Năng lượng sạch & Giao thông công cộng) → Kết bài.',
        sentences: [
          {
            section: 'Đoạn 1: Mở bài',
            vn: 'Trong những năm gần đây, ô nhiễm không khí đã trở thành một trong những vấn đề đáng báo động nhất tại các thành phố lớn. Bài tiểu luận này sẽ thảo luận các nguyên nhân chính gây ra ô nhiễm không khí và đề xuất một số giải pháp hiệu quả.',
            structure:
              'In recent years, air pollution has become one of the most alarming problems in big cities. This essay will discuss the main causes of air pollution and suggest some effective solutions.',
            keywords: ['In recent years', 'air pollution', 'one of the most alarming problems', 'effective solutions'],
            clauses: [
              {
                label: 'Giới thiệu vấn đề ô nhiễm không khí',
                regex: /\bin\s+recent\s+years\s*,\s*air\s+pollution\s+has\s+become\s+one\s+of\s+the\s+most\s+(alarming|serious|pressing)\s+(problems|issues)\b/i,
                partialRegex: /\bair\s+pollution\b/i,
                goodMsg: 'Dùng đúng thì Hiện tại hoàn thành với "In recent years" và cấu trúc "one of the most + adj + N (số nhiều)".',
                partialMsg: 'Lưu ý: Sau "one of the most alarming..." danh từ phải ở dạng số nhiều ("problems").',
                missingMsg: 'Thiếu câu giới thiệu: "In recent years, air pollution has become one of the most alarming problems in big cities."'
              },
              {
                label: 'Câu định hướng bài viết (Thesis statement)',
                regex: /\bthis\s+essay\s+will\s+discuss\s+the\s+(main\s+)?causes\s+of\s+air\s+pollution\s+and\s+(suggest|propose)\s+some\s+(effective\s+|practical\s+)?(solutions|measures)\b/i,
                goodMsg: 'Câu Thesis statement rõ ràng, chuẩn bố cục B2.',
                missingMsg: 'Thiếu câu Thesis statement: "This essay will discuss the main causes of air pollution and suggest some effective solutions."'
              }
            ],
            commonErrors: [
              {
                pattern: /\bone\s+of\s+the\s+most\s+\w+\s+problem\b/i,
                fix: 'Lỗi danh từ số ít sau "one of the...": Sau cấu trúc "one of the + so sánh nhất", danh từ bắt buộc phải ở dạng số nhiều → sửa "problem" thành "problems".',
                replace: [/\b(one\s+of\s+the\s+most\s+\w+\s+)problem\b/i, '$1problems']
              }
            ],
            sample:
              'In recent years, air pollution has become one of the most alarming problems in big cities. This essay will discuss the main causes of air pollution and suggest some effective solutions.'
          },
          {
            section: 'Đoạn 2: Thân bài 1 (Nguyên nhân)',
            vn: 'Có nhiều nguyên nhân gây ra ô nhiễm không khí. Nguyên nhân đầu tiên là lượng khí thải khổng lồ từ hàng triệu phương tiện giao thông cá nhân như ô tô và xe máy mỗi ngày. Thứ hai, các nhà máy công nghiệp thải ra nhiều khói bụi độc hại trực tiếp vào bầu khí quyển.',
            structure:
              'There are several causes of air pollution. Firstly, a huge amount of exhaust fumes is released from millions of private vehicles such as cars and motorbikes every day. Secondly, industrial factories release plenty of toxic smoke directly into the atmosphere.',
            keywords: ['exhaust fumes', 'private vehicles', 'industrial factories', 'atmosphere'],
            clauses: [
              {
                label: 'Nguyên nhân 1: Khí thải từ phương tiện cá nhân',
                regex: /\b(exhaust\s+fumes|emissions)\b.*\b(private\s+vehicles|cars\s+and\s+motorbikes)\b/i,
                partialRegex: /\b(cars\s+and\s+motorbikes|vehicles)\b/i,
                goodMsg: 'Dùng từ vựng chủ đề môi trường "exhaust fumes" và "private vehicles" rất tốt.',
                partialMsg: 'Gợi ý từ vựng B2 chỉ khí thải xe cộ: "exhaust fumes from private vehicles".',
                missingMsg: 'Thiếu nguyên nhân 1 về khí thải xe cộ (exhaust fumes from private vehicles).'
              },
              {
                label: 'Nguyên nhân 2: Khói độc từ nhà máy công nghiệp',
                regex: /\b(industrial\s+factories|factories)\s+(release|emit|discharge)\b.*\b(toxic\s+smoke|pollutants|gases)\s+(directly\s+)?into\s+the\s+(atmosphere|air)\b/i,
                partialRegex: /\bfactories\b.*\b(atmosphere|air)\b/i,
                goodMsg: 'Câu nêu nguyên nhân từ các nhà máy công nghiệp rất chuẩn xác.',
                partialMsg: 'Hoàn thiện câu: "Secondly, industrial factories release plenty of toxic smoke directly into the atmosphere."',
                missingMsg: 'Thiếu nguyên nhân 2: "Secondly, industrial factories release plenty of toxic smoke directly into the atmosphere."'
              }
            ],
            commonErrors: [],
            sample:
              'There are several causes of air pollution. Firstly, a huge amount of exhaust fumes is released from millions of private vehicles such as cars and motorbikes every day. Secondly, industrial factories release plenty of toxic smoke directly into the atmosphere.'
          },
          {
            section: 'Đoạn 3: Thân bài 2 (Giải pháp)',
            vn: 'Để giảm thiểu ô nhiễm không khí, cả chính phủ và từng cá nhân đều cần hành động. Trước hết, nhà nước nên khuyến khích sử dụng các nguồn năng lượng sạch như năng lượng mặt trời và năng lượng gió. Thứ hai, mỗi người dân nên ưu tiên sử dụng phương tiện giao thông công cộng như xe buýt thay vì đi xe cá nhân.',
            structure:
              'To reduce air pollution, both the government and individuals should take action. First, the state should encourage the use of clean energy such as solar and wind power. Second, each person should use public transport such as buses rather than private cars or motorbikes.',
            keywords: ['take action', 'clean energy', 'public transport', 'rather than'],
            clauses: [
              {
                label: 'Giải pháp 1: Khuyến khích năng lượng sạch',
                regex: /\bencourage\s+(the\s+use\s+of\s+|using\s+)?(clean|renewable)\s+energy\s+such\s+as\s+solar\s+and\s+wind\s+(power|energy)\b/i,
                partialRegex: /\b(clean|renewable|solar)\s+(energy|power)\b/i,
                goodMsg: 'Diễn đạt giải pháp năng lượng sạch (clean energy such as solar and wind power) chuẩn xác.',
                partialMsg: 'Hoàn thiện câu: "First, the state should encourage the use of clean energy such as solar and wind power."',
                missingMsg: 'Thiếu giải pháp 1 về năng lượng sạch (clean energy).'
              },
              {
                label: 'Giải pháp 2: Dùng phương tiện giao thông công cộng',
                regex: /\buse\s+public\s+(transport|transportation|means\s+of\s+transport)\s+such\s+as\s+buses\s+(rather\s+than|instead\s+of)\b/i,
                partialRegex: /\bpublic\s+(transport|transportation)\b/i,
                goodMsg: 'Nêu giải pháp sử dụng giao thông công cộng ("public transport ... rather than ...") rất mạch lạc.',
                partialMsg: 'Dùng cấu trúc đối chiếu: "use public transport such as buses rather than private cars or motorbikes".',
                missingMsg: 'Thiếu giải pháp 2 về phương tiện giao thông công cộng (public transport).'
              }
            ],
            commonErrors: [],
            sample:
              'To reduce air pollution, both the government and individuals should take action. First, the state should encourage the use of clean energy such as solar and wind power. Second, each person should use public transport such as buses rather than private cars or motorbikes.'
          },
          {
            section: 'Đoạn 4: Kết bài',
            vn: 'Tóm lại, ô nhiễm không khí đã gây ra nhiều vấn đề tiêu cực trong xã hội hiện đại và con người cần giải quyết càng sớm càng tốt. Nếu các giải pháp trên được áp dụng, tình hình sẽ trở nên tốt hơn.',
            structure:
              'In conclusion, air pollution has led to plenty of negative issues in modern society and we should solve it as soon as possible. If the solutions above are applied, the situation will be better.',
            keywords: ['In conclusion', 'negative issues', 'as soon as possible', 'If the solutions above are applied'],
            clauses: [
              {
                label: 'Tóm tắt tác hại của ô nhiễm không khí',
                regex: /\b(in\s+conclusion|to\s+sum\s+up)\s*,\s*air\s+pollution\s+has\s+(led\s+to|caused)\s+(plenty\s+of|many)\s+negative\s+(issues|problems)\b/i,
                partialRegex: /\b(in\s+conclusion|to\s+sum\s+up)\b/i,
                goodMsg: 'Mở đầu đoạn kết bài chuẩn xác.',
                partialMsg: 'Viết đủ câu: "In conclusion, air pollution has led to plenty of negative issues in modern society and we should solve it as soon as possible."',
                missingMsg: 'Thiếu câu đầu kết bài: "In conclusion, air pollution has led to plenty of negative issues in modern society..."'
              },
              {
                label: 'Câu điều kiện khẳng định tính hiệu quả của giải pháp',
                regex: /\bif\s+the\s+solutions\s+above\s+are\s+applied\s*,\s*the\s+situation\s+will\s+(be\s+better|improve)\b/i,
                goodMsg: 'Câu chốt bài "If the solutions above are applied, the situation will be better" hoàn chỉnh.',
                missingMsg: 'Thiếu câu chốt bài: "If the solutions above are applied, the situation will be better."'
              }
            ],
            commonErrors: [],
            sample:
              'In conclusion, air pollution has led to plenty of negative issues in modern society and we should solve it as soon as possible. If the solutions above are applied, the situation will be better.'
          }
        ]
      }
    ]
  };

  let curTopicIdx = 0;
  let curSentIdx = 0;

  function getProgressStore(state) {
    if (!state.drafts) state.drafts = {};
    if (!state.drafts.vstepSentProgV2) state.drafts.vstepSentProgV2 = {};
    return state.drafts.vstepSentProgV2;
  }

  function getTopicState(state, topicId, totalSentences) {
    const store = getProgressStore(state);
    if (!store[topicId]) {
      store[topicId] = {
        activeIdx: 0,
        sentences: {} // idx -> { text: '', passed: false, pct: 0, feedback: '', showHint: false }
      };
    }
    const st = store[topicId];
    if (typeof st.activeIdx !== 'number' || st.activeIdx < 0 || st.activeIdx >= totalSentences) {
      st.activeIdx = 0;
    }
    return st;
  }

  // Tính độ tương đồng theo Longest Common Subsequence (LCS) để không bị lệch vị trí từ khi học viên viết ngắn/dài hơn 1-2 từ
  function computeWordLCSRatio(sampleStr, userStr) {
    const norm = (s) =>
      String(s || '')
        .toLowerCase()
        .replace(/[^a-z0-9'\s]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);
    const a = norm(sampleStr);
    const b = norm(userStr);
    if (!a.length || !b.length) return 0;
    const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
        else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
    return dp[a.length][b.length] / Math.max(1, Math.min(a.length, Math.max(6, b.length)));
  }

  // Kiểm tra các lỗi cơ học, chính tả, viết hoa, dấu câu, ngữ pháp chung trên chính câu của học viên
  function detectGeneralMechanicsAndGrammar(text) {
    const issues = []; // { type: 'minor'|'major', desc: string, applyFix: (s) => s }

    // 1. Chữ cái đầu câu chưa viết hoa
    if (/^[a-z]/.test(text)) {
      const firstWord = (text.match(/^[a-zA-Z]+/) || [''])[0];
      const capWord = firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
      issues.push({
        type: 'minor',
        desc: `Chữ cái đầu câu chưa viết hoa: Sửa "${firstWord}" → "${capWord}".`,
        applyFix: (s) => s.replace(/^[a-z]/, (c) => c.toUpperCase())
      });
    }

    // 2. Đại từ nhân xưng "i" viết thường
    if (/\bi(?=['’]m\b|['’]ve\b|['’]ll\b|['’]d\b|\s)/g.test(text)) {
      issues.push({
        type: 'minor',
        desc: 'Đại từ nhân xưng "I" trong tiếng Anh luôn phải viết hoa.',
        applyFix: (s) => s.replace(/\bi(?=['’]m\b|['’]ve\b|['’]ll\b|['’]d\b|\s)/g, 'I')
      });
    }

    // 3. Viết hoa không cần thiết ở giữa câu (ví dụ: "How are you Today?" -> "today")
    // Tách các từ kèm vị trí để kiểm tra xem phía trước có phải dấu kết câu (. ? ! , sau Dear ...) không
    const wordRe = /\b([A-Z][a-z]+)\b/g;
    let m;
    while ((m = wordRe.exec(text)) !== null) {
      const w = m[1];
      const idx = m.index;
      if (idx === 0) continue; // Từ đầu câu
      if (VALID_MID_CAPS.has(w)) continue;

      // Kiểm tra ký tự trước từ này: nếu ngay sau dấu . ! ? hoặc ngay sau dấu phẩy của lời chào đầu thư ("Dear Jane, How...") thì hợp lệ
      const before = text.slice(0, idx);
      if (/[.!?]\s*$/.test(before)) continue;
      if (/^\s*(?:dear|hi|hello)\s+[a-z]+\s*,\s*$/i.test(before) && /^how$/i.test(w)) continue;

      const lowerW = w.toLowerCase();
      issues.push({
        type: 'minor',
        desc: `Viết hoa chưa đúng chỗ: Chữ "${w}" đứng giữa câu và không phải danh từ riêng → sửa thành "${lowerW}".`,
        applyFix: (s) =>
          s.replace(new RegExp(`(\\s)${w}(?=[\\s,.!?;:]|$)`), `$1${lowerW}`)
      });
    }

    // 4. Khoảng trắng đặt sai trước dấu phẩy / dấu chấm (ví dụ: "friend ,An," -> "friend, An,")
    const badCommaMatch = text.match(/([a-zA-Z0-9])\s+,(\s*[a-zA-Z0-9]+)?/);
    if (badCommaMatch) {
      const rawSeg = badCommaMatch[0];
      const fixedSeg = rawSeg.replace(/\s+,/, ',').replace(/,(\S)/, ', $1');
      issues.push({
        type: 'minor',
        desc: `Đặt khoảng trắng dấu phẩy chưa chuẩn ở "${rawSeg.trim()}" → Dấu phẩy phải viết sát ngay sau từ đứng trước và cách 1 khoảng trắng phía sau: sửa thành "${fixedSeg.trim()}".`,
        applyFix: (s) => s.replace(/\s+,/g, ',').replace(/,([^\s,])/g, ', $1')
      });
    } else if (/,([a-zA-Z])/.test(text)) {
      const noSpaceAfterComma = text.match(/[a-zA-Z]+,[a-zA-Z]+/);
      if (noSpaceAfterComma) {
        const seg = noSpaceAfterComma[0];
        const fixed = seg.replace(/,/, ', ');
        issues.push({
          type: 'minor',
          desc: `Thiếu khoảng trắng sau dấu phẩy ở "${seg}" → sửa thành "${fixed}".`,
          applyFix: (s) => s.replace(/,([a-zA-Z])/g, ', $1')
        });
      }
    }

    // 5. Lặp từ liên tiếp (ví dụ: "the the", "to to", "is is")
    const dupMatch = text.match(/\b([a-zA-Z]+)\s+\1\b/i);
    if (dupMatch && dupMatch[1].toLowerCase() !== 'had') {
      issues.push({
        type: 'minor',
        desc: `Bị lặp từ "${dupMatch[0]}" → bỏ bớt 1 chữ "${dupMatch[1]}".`,
        applyFix: (s) => s.replace(/\b([a-zA-Z]+)\s+\1\b/gi, '$1')
      });
    }

    // 6. Động từ khuyết thiếu (can/will/should/would/must/may/could) + "to V"
    const modalToMatch = text.match(/\b(can|cannot|will|would|should|must|may|might|could)\s+to\s+([a-z]+)\b/i);
    if (modalToMatch) {
      issues.push({
        type: 'major',
        desc: `Sai cấu trúc động từ khuyết thiếu: Sau "${modalToMatch[1]}" dùng động từ nguyên mẫu không "to" → sửa "${modalToMatch[0]}" thành "${modalToMatch[1]} ${modalToMatch[2]}".`,
        applyFix: (s) =>
          s.replace(/\b(can|cannot|will|would|should|must|may|might|could)\s+to\s+([a-z]+)\b/gi, '$1 $2')
      });
    }

    // 7. Danh từ không đếm được bị thêm "-s" (informations, advices, equipments, knowledges, pollutions, homeworks)
    const uncountableMatch = text.match(
      /\b(informations|advices|equipments|knowledges|homeworks|furnitures|pollutions|traffics)\b/i
    );
    if (uncountableMatch) {
      const wrongNoun = uncountableMatch[1];
      const fixedNoun = wrongNoun.replace(/s$/i, '');
      issues.push({
        type: 'major',
        desc: `Lỗi danh từ không đếm được: "${wrongNoun}" là danh từ không đếm được nên không thêm "-s" → sửa thành "${fixedNoun}".`,
        applyFix: (s) =>
          s.replace(
            /\b(information|advice|equipment|knowledge|homework|furniture|pollution|traffic)s\b/gi,
            '$1'
          )
      });
    }

    // 8. Thừa giới từ in/on/at trước this/next/last/every + thời gian
    const prepTimeMatch = text.match(
      /\b(in|on|at)\s+(this|next|last|every)\s+(summer|winter|spring|autumn|fall|week|month|year|morning|afternoon|evening)\b/i
    );
    if (prepTimeMatch) {
      const fullPrep = prepTimeMatch[0];
      const fixedTime = `${prepTimeMatch[2]} ${prepTimeMatch[3]}`;
      issues.push({
        type: 'major',
        desc: `Thừa giới từ "${prepTimeMatch[1]}": Trước "${fixedTime}" không dùng giới từ → sửa "${fullPrep}" thành "${fixedTime}".`,
        applyFix: (s) =>
          s.replace(
            /\b(?:in|on|at)\s+((?:this|next|last|every)\s+(?:summer|winter|spring|autumn|fall|week|month|year|morning|afternoon|evening))\b/gi,
            '$1'
          )
      });
    }

    // 9. Sau giới từ (instead of / good at / keen on / fond of / capable of / interested in / thank you for) dùng V nguyên mẫu thay vì V-ing
    const prepVerbMatch = text.match(
      /\b(instead\s+of|good\s+at|keen\s+on|fond\s+of|capable\s+of|interested\s+in|thank\s+you\s+for)\s+(read|cook|take|study|play|meet|surf|use|seek|help|work|speak|listen|watch|make|go|eat|jog|run)\b/i
    );
    if (prepVerbMatch) {
      const prepPart = prepVerbMatch[1];
      const baseV = prepVerbMatch[2].toLowerCase();
      const ingMap = {
        take: 'taking',
        make: 'making',
        use: 'using',
        run: 'running',
        jog: 'jogging'
      };
      const vIng = ingMap[baseV] || baseV + 'ing';
      issues.push({
        type: 'major',
        desc: `Sai dạng động từ sau giới từ: Sau "${prepPart}" động từ phải ở dạng V-ing → sửa "${prepPart} ${prepVerbMatch[2]}" thành "${prepPart} ${vIng}".`,
        applyFix: (s) =>
          s.replace(new RegExp(`\\b(${prepPart})\\s+${prepVerbMatch[2]}\\b`, 'i'), `$1 ${vIng}`)
      });
    }

    // 10. Lỗi hòa hợp chủ ngữ - động từ phổ biến ("there is many/several", "people is/has")
    if (/\bthere\s+is\s+(many|several|two|three|some|plenty\s+of|numerous)\b/i.test(text)) {
      issues.push({
        type: 'major',
        desc: 'Sai sự hòa hợp chủ ngữ - động từ: Đi với danh từ số nhiều phải dùng "There are...", không dùng "There is...".',
        applyFix: (s) =>
          s.replace(/\b(there)\s+is\s+(many|several|two|three|some|plenty\s+of|numerous)\b/gi, '$1 are $2')
      });
    }

    // 11. Thiếu dấu chấm kết thúc câu (.)
    if (!/[.!?]$/.test(text)) {
      const lastWord = (text.match(/(\S+)$/) || [''])[1];
      issues.push({
        type: 'minor',
        desc: `Cuối câu thiếu dấu chấm kết thúc: Thêm dấu "." sau chữ "${lastWord}".`,
        applyFix: (s) => s.replace(/\s*$/, '.')
      });
    }

    return issues;
  }

  // Phân tích sâu từng vế câu (clauses), lỗi ngữ pháp, từ vựng và tạo câu sửa trực tiếp trên câu của học viên
  function analyzeUserSentence(userText, sentObj) {
    const clean = String(userText || '').trim();
    const words = clean.split(/\s+/).filter(Boolean);
    const wc = words.length;

    if (wc < 3) {
      return {
        pct: 15,
        passed: false,
        clauseResults: [],
        specificIssues: ['Câu quá ngắn, chưa đủ cấu trúc Chủ ngữ + Động từ (S + V).'],
        repairedUserText: '',
        suggestedStructure: sentObj.structure
      };
    }

    let repaired = clean;
    const specificIssues = [];
    const issueSet = new Set();
    const addIssue = (msg) => {
      if (msg && !issueSet.has(msg)) {
        issueSet.add(msg);
        specificIssues.push(msg);
      }
    };

    let majorErrorCount = 0;
    let minorErrorCount = 0;

    // 1. Kiểm tra các lỗi ngữ pháp đặc thù của câu này (commonErrors)
    (sentObj.commonErrors || []).forEach((err) => {
      if (err.pattern.test(clean)) {
        majorErrorCount++;
        addIssue(err.fix);
        if (Array.isArray(err.replace) && err.replace.length === 2) {
          repaired = repaired.replace(err.replace[0], err.replace[1]);
        }
      }
    });

    // 2. Phân tích từng vế ý nghĩa (Clauses) trong câu của học viên
    const clauses = sentObj.clauses || [];
    const clauseResults = [];
    let clauseScoreSum = 0;

    clauses.forEach((cl) => {
      const fullMatch = clean.match(cl.regex);
      if (fullMatch) {
        clauseScoreSum += 1;
        clauseResults.push({
          status: 'ok',
          label: cl.label,
          matchedText: fullMatch[0].trim(),
          note: cl.goodMsg
        });
      } else if (cl.partialRegex && cl.partialRegex.test(clean)) {
        const partMatch = clean.match(cl.partialRegex);
        clauseScoreSum += 0.75;
        clauseResults.push({
          status: 'partial',
          label: cl.label,
          matchedText: partMatch ? partMatch[0].trim() : '',
          note: cl.partialMsg || cl.missingMsg
        });
        if (cl.partialMsg && majorErrorCount === 0) {
          addIssue(cl.partialMsg);
        }
      } else {
        clauseResults.push({
          status: 'missing',
          label: cl.label,
          matchedText: '',
          note: cl.missingMsg
        });
        addIssue(cl.missingMsg);
      }
    });

    // 3. Kiểm tra lỗi viết hoa, dấu câu, khoảng trắng và ngữ pháp chung trên chính câu của học viên
    const mechIssues = detectGeneralMechanicsAndGrammar(clean);
    mechIssues.forEach((mi) => {
      if (mi.type === 'major') majorErrorCount++;
      else minorErrorCount++;
      addIssue(mi.desc);
      if (typeof mi.applyFix === 'function') {
        repaired = mi.applyFix(repaired);
      }
    });

    // Chuẩn hóa khoảng trắng của câu đã sửa
    repaired = repaired.replace(/\s{2,}/g, ' ').trim();

    // 4. Tính % độ phù hợp công bằng (dựa trên số vế đạt + độ khớp từ vựng LCS, trừ điểm theo mức độ lỗi)
    const clauseRatio = clauses.length ? clauseScoreSum / clauses.length : 0.8;
    const lcsRatio = computeWordLCSRatio(sentObj.sample, clean);
    const baseScore = Math.round(Math.max(clauseRatio * 100, clauseRatio * 75 + lcsRatio * 25));

    const penalty = majorErrorCount * 6 + minorErrorCount * 3;
    let pct = Math.max(20, Math.min(100, baseScore - penalty));

    // Nếu đạt tất cả các vế và không có lỗi nào -> 100%
    if (clauseRatio === 1 && specificIssues.length === 0) {
      pct = 100;
    } else if (clauseRatio >= 0.85 && majorErrorCount === 0 && minorErrorCount <= 2) {
      // Nếu đúng hết ngữ pháp & cấu trúc các vế, chỉ lỗi nhỏ về dấu câu/viết hoa -> 90% - 96%
      pct = Math.max(pct, 98 - minorErrorCount * 3);
    }

    const passed = pct >= 85 && majorErrorCount === 0;

    return {
      pct,
      passed,
      clauseResults,
      specificIssues,
      minorErrorCount,
      majorErrorCount,
      repairedUserText: repaired !== clean ? repaired : '',
      suggestedStructure: sentObj.structure
    };
  }

  function buildEvaluationHTML(userTxt, curSent, res) {
    const esc = global.LexiAcademy.esc;

    // Phần 1: Đánh giá từng vế trong câu của bạn
    const clauseHtml = res.clauseResults.length
      ? `<div class="space-y-1.5">
           ${res.clauseResults
             .map((c) => {
               if (c.status === 'ok') {
                 return `<div class="p-2 rounded-lg bg-ok/10 border border-ok/30 text-xs">
                   <span class="text-ok font-bold">✓ ${esc(c.label)}:</span>
                   <span class="font-mono text-fg font-semibold">"${esc(c.matchedText)}"</span>
                   <span class="text-mute"> — ${esc(c.note)}</span>
                 </div>`;
               }
               if (c.status === 'partial') {
                 return `<div class="p-2 rounded-lg bg-warn/10 border border-warn/30 text-xs">
                   <span class="text-warn font-bold">⚠️ ${esc(c.label)}:</span>
                   ${c.matchedText ? `<span class="font-mono text-fg">Bạn viết: "${esc(c.matchedText)}"</span> — ` : ''}
                   <span class="text-fg">${esc(c.note)}</span>
                 </div>`;
               }
               return `<div class="p-2 rounded-lg bg-bad/10 border border-bad/30 text-xs">
                 <span class="text-bad font-bold">✗ ${esc(c.label)}:</span>
                 <span class="text-fg">${esc(c.note)}</span>
               </div>`;
             })
             .join('')}
         </div>`
      : '';

    // Phần 2: Các điểm cần chỉnh sửa trên câu của học viên
    const issuesHtml = res.specificIssues.length
      ? `<ul class="list-disc pl-4 space-y-1 text-warn text-xs">
           ${res.specificIssues.map((x) => `<li>${esc(x)}</li>`).join('')}
         </ul>`
      : `<div class="text-ok font-semibold text-xs">✓ Câu của bạn đã chính xác về ngữ pháp, từ vựng và dấu câu!</div>`;

    // Phần 3: Gợi ý sửa trực tiếp trên câu của học viên (giữ nguyên từ vựng học viên đã chọn)
    const repairedHtml =
      res.repairedUserText && res.repairedUserText !== userTxt
        ? `<div class="p-2.5 rounded-lg bg-pri/10 border border-pri/30 space-y-1.5 text-xs">
             <div class="flex flex-wrap items-center justify-between gap-2">
               <b class="text-pri">Gợi ý chỉnh lại trên chính câu của bạn:</b>
               <button type="button" id="wrt-apply-repair-btn" class="px-2.5 py-1 rounded bg-pri text-slate-950 font-bold text-[11px] hover:opacity-90 whitespace-nowrap">
                 Áp dụng câu đã sửa
               </button>
             </div>
             <div class="font-mono text-fg font-medium">${esc(res.repairedUserText)}</div>
           </div>`
        : '';

    return `
      <div class="space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-line/60 pb-2">
          <div class="flex items-center gap-2 text-xs">
            <span class="font-mono tabular-nums font-bold ${res.pct >= 85 ? 'text-ok' : 'text-warn'}">
              Độ phù hợp: ${res.pct}%
            </span>
            <span aria-hidden="true" class="text-mute">·</span>
            <span class="font-semibold ${res.passed ? 'text-ok' : 'text-warn'}">
              ${
                res.pct === 100
                  ? '✓ Hoàn hảo (100%) — Có thể qua câu tiếp theo'
                  : res.passed
                  ? '✓ Đạt yêu cầu (có thể sửa thêm lỗi nhỏ bên dưới để đạt 100%)'
                  : 'Cần chỉnh sửa lại các điểm bên dưới'
              }
            </span>
          </div>
          ${
            !res.passed
              ? `<button type="button" id="wrt-open-hint-from-fb" class="text-xs text-pri underline whitespace-nowrap">Mở xem gợi ý cấu trúc</button>`
              : ''
          }
        </div>

        <div class="space-y-2 text-xs leading-relaxed">
          <div><b class="text-fg">1. Phân tích từng vế trong câu của bạn:</b></div>
          ${clauseHtml}
        </div>

        <div class="space-y-1.5 text-xs leading-relaxed pt-1 border-t border-line/40">
          <div><b class="text-fg">2. Lỗi ngữ pháp / cách dùng từ / dấu câu cần sửa:</b></div>
          ${issuesHtml}
          ${repairedHtml}
        </div>

        <div class="text-xs leading-relaxed pt-1 border-t border-line/40">
          <b class="text-fg">3. Cấu trúc chuẩn của câu này:</b>
          <span class="font-mono text-pri ml-1">${esc(res.suggestedStructure)}</span>
        </div>

        <div id="wrt-ai-detail-slot" class="hidden text-xs leading-relaxed pt-2 border-t border-line/50"></div>

        <!-- Câu mẫu tham khảo luôn được ẩn trong thẻ <details>, chỉ khi người học bấm mới mở -->
        <details class="pt-1 border-t border-line/40 text-xs">
          <summary class="cursor-pointer text-mute hover:text-fg select-none">Xem câu tham khảo (chỉ mở khi bạn thực sự cần)</summary>
          <div class="mt-1.5 p-2 rounded-lg bg-inset font-mono text-ok">${esc(curSent.sample)}</div>
        </details>
      </div>
    `;
  }

  function render(lv, state) {
    const list = WRITING_DATA[lv] || WRITING_DATA.B1;
    if (curTopicIdx >= list.length) curTopicIdx = 0;
    const item = list[curTopicIdx];
    const tState = getTopicState(state, item.id, item.sentences.length);
    curSentIdx = tState.activeIdx;
    const curSent = item.sentences[curSentIdx];
    const curSaved = tState.sentences[curSentIdx] || {
      text: '',
      passed: false,
      pct: 0,
      feedback: '',
      showHint: false
    };
    const esc = global.LexiAcademy.esc;

    // Tự động nâng cấp toàn bộ các câu đã lưu từ phiên bản cũ (bị kẹt "Đang phân tích sâu hơn..." hoặc chấm lệch %)
    item.sentences.forEach((sObj, idx) => {
      const sSaved = tState.sentences[idx];
      if (
        sSaved &&
        sSaved.text &&
        sSaved.feedback &&
        (sSaved.feedback.includes('Đang phân tích sâu hơn') ||
          sSaved.feedback.includes('Từ/cụm từ nên kết hợp thêm') ||
          !sSaved.feedback.includes('1. Phân tích từng vế trong câu của bạn'))
      ) {
        const freshRes = analyzeUserSentence(sSaved.text, sObj);
        sSaved.pct = freshRes.pct;
        sSaved.passed = freshRes.passed;
        sSaved.feedback = buildEvaluationHTML(sSaved.text, sObj, freshRes);
      }
    });

    let passedCount = 0;
    item.sentences.forEach((_, idx) => {
      if (tState.sentences[idx] && tState.sentences[idx].passed) passedCount++;
    });

    const assembledEssay = item.sentences
      .map((_, idx) =>
        tState.sentences[idx] && tState.sentences[idx].text ? tState.sentences[idx].text.trim() : ''
      )
      .filter(Boolean)
      .join(' ');
    const totalWords = assembledEssay ? assembledEssay.split(/\s+/).length : 0;

    return `
      <div class="space-y-4">
        <!-- KHUNG TRÊN: CHỌN ĐỀ BÀI & ĐỀ BÀI (TỐI GIẢN) -->
        <div class="card p-4 space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div class="flex items-center gap-2 text-xs text-mute">
                <span class="font-mono text-pri">${esc(item.type)}</span>
                <span aria-hidden="true">·</span>
                <span class="font-mono tabular-nums">Hoàn thành ${passedCount}/${item.sentences.length} câu</span>
              </div>
              <h3 class="text-base font-bold mt-0.5">${esc(item.title)}</h3>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" id="wrt-reset-topic" class="btn !py-1.5 !px-3 !text-xs text-mute whitespace-nowrap">Làm lại đề này</button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            ${list
              .map((it, idx) => {
                const st = getTopicState(state, it.id, it.sentences.length);
                const doneCnt = it.sentences.filter(
                  (_, si) => st.sentences[si] && st.sentences[si].passed
                ).length;
                const isCurrent = idx === curTopicIdx;
                return `
                <button type="button" data-wrt-topic="${idx}" class="text-left p-2.5 rounded-xl border transition ${
                  isCurrent ? 'border-pri bg-pri/15 font-bold' : 'border-line/60 hover:bg-line/20'
                } text-xs flex items-center justify-between gap-2">
                  <span class="truncate">${esc(it.title)}</span>
                  <span class="font-mono tabular-nums text-[10px] shrink-0 ${
                    doneCnt === it.sentences.length ? 'text-ok font-bold' : 'text-mute'
                  }">${doneCnt}/${it.sentences.length}</span>
                </button>
              `;
              })
              .join('')}
          </div>

          <div class="inset p-3 text-xs space-y-1 leading-relaxed">
            <div><b class="text-warn">Đề bài:</b> ${esc(item.prompt)}</div>
            <div class="text-mute"><b>Bố cục:</b> ${esc(item.formulaNote)}</div>
          </div>
        </div>

        <!-- GIAO DIỆN 2 CỘT: TRÁI (DÀN Ý TIẾNG VIỆT) - PHẢI (VIẾT TIẾNG ANH & ĐÁNH GIÁ) -->
        <div class="grid lg:grid-cols-12 gap-4 items-start">
          
          <!-- CỘT TRÁI (5/12): ĐOẠN VĂN TIẾNG VIỆT (HIỆU ỨNG CHẠY CÂU) -->
          <div class="lg:col-span-5 card p-4 space-y-3 lg:sticky lg:top-20">
            <div class="flex items-center justify-between border-b border-line/60 pb-2">
              <b class="text-sm">Dàn bài Tiếng Việt</b>
              <span class="text-xs font-mono tabular-nums text-warn font-bold">Câu ${curSentIdx + 1}/${item.sentences.length}</span>
            </div>

            <div class="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              ${item.sentences
                .map((s, idx) => {
                  const sData = tState.sentences[idx] || {};
                  const isActive = idx === curSentIdx;
                  const isPassed = !!sData.passed;
                  const prevSection = idx > 0 ? item.sentences[idx - 1].section : '';
                  const showSecHeader = s.section !== prevSection;

                  return `
                  ${showSecHeader ? `<div class="text-[11px] font-bold text-pri pt-1.5 first:pt-0">${esc(s.section)}</div>` : ''}
                  <div data-wrt-jump="${idx}" class="cursor-pointer p-3 rounded-xl border transition ${
                    isActive
                      ? 'border-warn bg-warn/15 ring-1 ring-warn/50'
                      : isPassed
                      ? 'border-ok/40 bg-ok/10'
                      : 'border-line/50 bg-inset/50 opacity-65 hover:opacity-100'
                  }">
                    <div class="flex items-center justify-between gap-2 mb-1">
                      <span class="text-[11px] font-mono font-bold ${
                        isActive ? 'text-warn' : isPassed ? 'text-ok' : 'text-mute'
                      }">
                        ${
                          isActive
                            ? 'Câu ' + (idx + 1) + ' · Đang viết'
                            : isPassed
                            ? '✓ Câu ' + (idx + 1) + ' · Đã đạt'
                            : 'Câu ' + (idx + 1)
                        }
                      </span>
                      ${
                        sData.pct
                          ? `<span class="text-[11px] font-mono tabular-nums ${
                              sData.pct >= 85 ? 'text-ok' : 'text-warn'
                            } font-bold">${sData.pct}%</span>`
                          : ''
                      }
                    </div>
                    <p class="text-xs sm:text-sm leading-relaxed ${
                      isActive ? 'font-semibold text-fg' : 'text-fg/90'
                    }">
                      ${esc(s.vn)}
                    </p>
                    ${
                      sData.text
                        ? `<div class="mt-1.5 pt-1.5 border-t border-line/40 text-xs font-mono text-ok italic">
                             ${esc(sData.text)}
                           </div>`
                        : ''
                    }
                  </div>
                `;
                })
                .join('')}
            </div>
          </div>

          <!-- CỘT PHẢI (7/12): TƯƠNG TÁC VIẾT CÂU TIẾNG ANH & PHẢN HỒI AI -->
          <div class="lg:col-span-7 space-y-4">
            <div class="card p-4 sm:p-5 space-y-3.5">
              <!-- Thanh điều hướng câu + Nút Ẩn/Hiện Gợi ý -->
              <div class="flex flex-wrap items-center justify-between gap-2 border-b border-line/60 pb-2.5">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-mono tabular-nums font-bold text-warn">
                    Câu ${curSentIdx + 1} / ${item.sentences.length}
                  </span>
                  <span aria-hidden="true" class="text-mute">·</span>
                  <button type="button" id="wrt-toggle-hint" class="btn !py-1 !px-2.5 !text-xs whitespace-nowrap ${
                    curSaved.showHint ? 'border-pri text-pri bg-pri/10' : ''
                  }">
                    ${curSaved.showHint ? 'Ẩn gợi ý & cấu trúc' : 'Xem gợi ý & cấu trúc'}
                  </button>
                </div>

                <div class="flex items-center gap-1.5">
                  <button type="button" id="wrt-prev-sent" class="btn !py-1 !px-2.5 !text-xs whitespace-nowrap" ${
                    curSentIdx === 0 ? 'disabled' : ''
                  }>← Trước</button>
                  <button type="button" id="wrt-next-sent" class="btn !py-1 !px-2.5 !text-xs whitespace-nowrap" ${
                    curSentIdx === item.sentences.length - 1 ? 'disabled' : ''
                  }>Tiếp →</button>
                </div>
              </div>

              <!-- Khung Gợi ý & Cấu trúc (MẶC ĐỊNH ẨN - chỉ hiện khi người học chủ động bấm mở) -->
              <div id="wrt-hint-box" class="${
                curSaved.showHint ? '' : 'hidden'
              } inset p-3 rounded-xl space-y-2 text-xs border border-pri/30">
                <div>
                  <span class="font-bold text-pri">Cấu trúc:</span>
                  <span class="font-mono text-fg ml-1">${esc(curSent.structure)}</span>
                </div>
                <div class="flex flex-wrap items-center gap-1.5 pt-1">
                  <span class="font-bold text-mute">Từ gợi ý (bấm để chèn):</span>
                  ${(curSent.keywords || [])
                    .map(
                      (kw) => `
                    <button type="button" data-wrt-kw="${esc(
                      kw
                    )}" class="px-2 py-0.5 rounded border border-pri/40 bg-pri/10 text-pri font-mono text-xs hover:bg-pri/20 whitespace-nowrap">
                      + ${esc(kw)}
                    </button>
                  `
                    )
                    .join('')}
                </div>
              </div>

              <!-- Ô nhập câu tiếng Anh (Hiển thị gọn câu tiếng Việt đang viết để tiện đối chiếu khi dùng điện thoại chia trên - dưới) -->
              <div class="space-y-2.5">
                <div class="inset p-3 rounded-xl border border-warn/30 bg-warn/5 text-xs sm:text-sm leading-relaxed">
                  <span class="font-mono font-bold text-warn mr-1.5">Câu ${curSentIdx + 1}:</span>
                  <span class="font-medium text-fg">${esc(curSent.vn)}</span>
                </div>

                <label for="wrt-sent-input" class="block text-xs font-bold text-mute">
                  Viết câu tiếng Anh tương ứng:
                </label>
                <textarea
                  id="wrt-sent-input"
                  rows="3"
                  class="inp text-sm sm:text-base font-medium leading-relaxed"
                  placeholder="Tự viết câu tiếng Anh của bạn tại đây..."
                >${esc(curSaved.text || '')}</textarea>

                <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <button type="button" id="wrt-eval-sent-btn" class="btn btn-pri font-bold !py-2 !px-4 whitespace-nowrap">
                      Đánh giá & Sửa lỗi câu ${curSentIdx + 1}
                    </button>
                    <button type="button" id="wrt-speak-sent-btn" class="btn !py-2 !px-3 !text-xs whitespace-nowrap" title="Nghe phát âm câu bạn vừa viết">
                      🔊 Nghe câu vừa viết
                    </button>
                  </div>

                  <button
                    type="button"
                    id="wrt-pass-next-btn"
                    class="btn ${curSaved.passed ? 'btn-ok font-bold' : ''} !py-2 !px-3.5 whitespace-nowrap"
                  >
                    ${
                      curSentIdx < item.sentences.length - 1
                        ? 'Qua câu tiếp theo (' + (curSentIdx + 2) + ') →'
                        : 'Hoàn thành bài viết ✓'
                    }
                  </button>
                </div>
              </div>

              <!-- KHU VỰC ĐÁNH GIÁ CHI TIẾT TỪNG VẾ CÂU CỦA NGƯỜI HỌC -->
              <div id="wrt-sent-feedback" class="${
                curSaved.feedback ? '' : 'hidden'
              } inset p-3.5 rounded-xl space-y-2.5 border border-line text-xs sm:text-sm">
                ${curSaved.feedback || ''}
              </div>
            </div>

            <!-- BẢN GHÉP CÁC CÂU ĐÃ VIẾT -->
            <div class="card p-4 space-y-2.5">
              <div class="flex flex-wrap items-center justify-between gap-2 border-b border-line/60 pb-2">
                <b class="text-xs sm:text-sm">Bài viết của bạn (ghép từ các câu đã viết)</b>
                <div class="flex items-center gap-2">
                  <span class="font-mono tabular-nums text-xs text-pri font-bold">${totalWords} từ</span>
                  <button type="button" id="wrt-speak-full" class="btn !py-1 !px-2.5 !text-xs whitespace-nowrap">🔊 Nghe cả bài</button>
                  <button type="button" id="wrt-copy-full" class="btn !py-1 !px-2.5 !text-xs whitespace-nowrap">Sao chép</button>
                </div>
              </div>
              <div class="inset p-3 rounded-xl text-xs sm:text-sm leading-relaxed font-mono min-h-[60px]">
                ${
                  assembledEssay
                    ? esc(assembledEssay)
                    : '<span class="text-mute italic">Các câu bạn viết sẽ tự động ghép thành bài hoàn chỉnh tại đây.</span>'
                }
              </div>
            </div>
          </div>

        </div>
      </div>
    `;
  }

  function bind(container, lv, state) {
    const list = WRITING_DATA[lv] || WRITING_DATA.B1;
    if (curTopicIdx >= list.length) curTopicIdx = 0;
    const item = list[curTopicIdx];
    const tState = getTopicState(state, item.id, item.sentences.length);
    curSentIdx = tState.activeIdx;
    const curSent = item.sentences[curSentIdx];
    const esc = global.LexiAcademy.esc;

    const sentInput = container.querySelector('#wrt-sent-input');
    const fbBox = container.querySelector('#wrt-sent-feedback');
    const hintBox = container.querySelector('#wrt-hint-box');
    const toggleHintBtn = container.querySelector('#wrt-toggle-hint');

    // Gắn sự kiện cho các nút bên trong khung phản hồi (mở gợi ý, áp dụng câu sửa)
    const bindFeedbackInnerEvents = () => {
      if (!fbBox) return;
      const openHintBtn = fbBox.querySelector('#wrt-open-hint-from-fb');
      if (openHintBtn && toggleHintBtn && hintBox && hintBox.classList.contains('hidden')) {
        openHintBtn.onclick = () => toggleHintBtn.click();
      }
      const applyRepairBtn = fbBox.querySelector('#wrt-apply-repair-btn');
      if (applyRepairBtn && sentInput) {
        applyRepairBtn.onclick = () => {
          const curTxt = sentInput.value.trim();
          const checkRes = analyzeUserSentence(curTxt, curSent);
          if (checkRes.repairedUserText) {
            sentInput.value = checkRes.repairedUserText;
            sentInput.dispatchEvent(new Event('input'));
            const evalBtnEl = container.querySelector('#wrt-eval-sent-btn');
            if (evalBtnEl) evalBtnEl.click();
          }
        };
      }
    };
    bindFeedbackInnerEvents();

    // Chuyển đề bài
    container.querySelectorAll('[data-wrt-topic]').forEach((btn) => {
      btn.onclick = () => {
        curTopicIdx = Number(btn.getAttribute('data-wrt-topic'));
        global.LexiAcademy.render();
      };
    });

    // Làm lại đề
    const resetBtn = container.querySelector('#wrt-reset-topic');
    if (resetBtn) {
      resetBtn.onclick = () => {
        const store = getProgressStore(state);
        store[item.id] = { activeIdx: 0, sentences: {} };
        global.LexiAcademy.saveState();
        global.LexiAcademy.render();
      };
    }

    // Chuyển câu khi bấm vào cột trái
    container.querySelectorAll('[data-wrt-jump]').forEach((cardEl) => {
      cardEl.onclick = () => {
        tState.activeIdx = Number(cardEl.getAttribute('data-wrt-jump'));
        global.LexiAcademy.saveState();
        global.LexiAcademy.render();
      };
    });

    // Nút Trước / Tiếp
    const prevBtn = container.querySelector('#wrt-prev-sent');
    const nextBtn = container.querySelector('#wrt-next-sent');
    if (prevBtn) {
      prevBtn.onclick = () => {
        if (curSentIdx > 0) {
          tState.activeIdx = curSentIdx - 1;
          global.LexiAcademy.saveState();
          global.LexiAcademy.render();
        }
      };
    }
    if (nextBtn) {
      nextBtn.onclick = () => {
        if (curSentIdx < item.sentences.length - 1) {
          tState.activeIdx = curSentIdx + 1;
          global.LexiAcademy.saveState();
          global.LexiAcademy.render();
        }
      };
    }

    // Ẩn / Hiện khung Gợi ý (Mặc định luôn ẩn khi mới vào câu)
    if (toggleHintBtn && hintBox) {
      toggleHintBtn.onclick = () => {
        if (!tState.sentences[curSentIdx]) tState.sentences[curSentIdx] = {};
        const nextShow = hintBox.classList.contains('hidden');
        tState.sentences[curSentIdx].showHint = nextShow;
        hintBox.classList.toggle('hidden', !nextShow);
        toggleHintBtn.textContent = nextShow ? 'Ẩn gợi ý & cấu trúc' : 'Xem gợi ý & cấu trúc';
        toggleHintBtn.classList.toggle('border-pri', nextShow);
        toggleHintBtn.classList.toggle('text-pri', nextShow);
        toggleHintBtn.classList.toggle('bg-pri/10', nextShow);
        global.LexiAcademy.saveState();
      };
    }

    // Lưu nháp khi gõ
    if (sentInput) {
      sentInput.addEventListener('input', () => {
        if (!tState.sentences[curSentIdx]) {
          tState.sentences[curSentIdx] = {
            text: '',
            passed: false,
            pct: 0,
            feedback: '',
            showHint: false
          };
        }
        tState.sentences[curSentIdx].text = sentInput.value;
        global.LexiAcademy.saveState();
      });
    }

    // Nghe phát âm câu vừa viết
    const speakSentBtn = container.querySelector('#wrt-speak-sent-btn');
    if (speakSentBtn && sentInput) {
      speakSentBtn.onclick = () => {
        const txt = sentInput.value.trim();
        if (!txt) {
          global.LexiAcademy.notify('Hãy viết câu tiếng Anh trước khi bấm nghe.');
          sentInput.focus();
          return;
        }
        if (typeof global.speakUS === 'function') global.speakUS(txt);
        else if (typeof global.speak === 'function') global.speak(txt);
      };
    }

    // Bấm chèn từ gợi ý
    container.querySelectorAll('[data-wrt-kw]').forEach((kwBtn) => {
      kwBtn.onclick = () => {
        const kw = kwBtn.getAttribute('data-wrt-kw');
        if (sentInput && kw) {
          const curVal = sentInput.value.trimEnd();
          sentInput.value = curVal ? curVal + ' ' + kw + ' ' : kw + ' ';
          sentInput.dispatchEvent(new Event('input'));
          sentInput.focus();
        }
      };
    });

    // Qua câu tiếp theo
    const passNextBtn = container.querySelector('#wrt-pass-next-btn');
    if (passNextBtn) {
      passNextBtn.onclick = () => {
        const txt = sentInput ? sentInput.value.trim() : '';
        if (txt.length < 4) {
          global.LexiAcademy.notify('Hãy viết câu tiếng Anh trước khi chuyển câu nhé.');
          if (sentInput) sentInput.focus();
          return;
        }
        const evalRes = analyzeUserSentence(txt, curSent);
        if (!tState.sentences[curSentIdx]) tState.sentences[curSentIdx] = {};
        tState.sentences[curSentIdx].text = txt;
        tState.sentences[curSentIdx].pct = evalRes.pct;
        tState.sentences[curSentIdx].passed = true;
        tState.sentences[curSentIdx].feedback = buildEvaluationHTML(txt, curSent, evalRes);

        const allDone = item.sentences.every((_, i) => tState.sentences[i] && tState.sentences[i].passed);
        if (allDone) {
          global.LexiAcademy.markDone(item.id);
          global.LexiAcademy.notify('Đã hoàn thành toàn bộ các câu trong bài!');
        }

        if (curSentIdx < item.sentences.length - 1) {
          tState.activeIdx = curSentIdx + 1;
        }
        global.LexiAcademy.saveState();
        global.LexiAcademy.render();
      };
    }

    // Đánh giá & Sửa lỗi chi tiết từng câu
    const evalBtn = container.querySelector('#wrt-eval-sent-btn');
    if (evalBtn && sentInput && fbBox) {
      evalBtn.onclick = async () => {
        const targetIdx = curSentIdx;
        const userTxt = sentInput.value.trim();
        if (userTxt.length < 3) {
          global.LexiAcademy.notify('Hãy nhập câu tiếng Anh của bạn để đánh giá.');
          sentInput.focus();
          return;
        }

        const res = analyzeUserSentence(userTxt, curSent);
        if (!tState.sentences[targetIdx]) tState.sentences[targetIdx] = {};
        tState.sentences[targetIdx].text = userTxt;
        tState.sentences[targetIdx].pct = res.pct;
        tState.sentences[targetIdx].passed = res.passed;

        const baseHtml = buildEvaluationHTML(userTxt, curSent, res);
        tState.sentences[targetIdx].feedback = baseHtml;
        global.LexiAcademy.saveState();

        // Cập nhật lại giao diện để cột trái và nút bấm hiển thị đúng % mới nhất
        global.LexiAcademy.render();

        // Nếu hệ thống có kết nối AI trực tuyến (và phản hồi nhanh trong 6 giây), bổ sung thêm nhận xét mở rộng
        const aiFn = typeof global.ai === 'function' ? global.ai : typeof global.rawAi === 'function' ? global.rawAi : null;
        if (aiFn) {
          try {
            const prompt = `Bạn là giáo viên chấm câu tiếng Anh VSTEP.
- Ý tiếng Việt cần diễn đạt: "${curSent.vn}"
- Câu học viên thực tế đã viết: "${userTxt}"

Hãy nhận xét trực tiếp vào từng từ/cụm từ học viên đã viết (tối đa 3 dòng ngắn gọn, không viết dài dòng):
1. Khen các cụm từ học viên đã dùng đúng và tự nhiên.
2. Chỉ rõ từ/cụm từ nào học viên viết sai ngữ pháp, sai thì, sai dấu câu/viết hoa (nếu có) và cách sửa đúng ngay trên câu của học viên.`;

            const aiPromise = aiFn(prompt, undefined, true);
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('timeout')), 6500)
            );
            const aiRes = await Promise.race([aiPromise, timeoutPromise]);
            if (aiRes && String(aiRes).trim()) {
              const cleanAi = esc(String(aiRes).trim())
                .replace(/\*\*(.+?)\*\*/g, '<b class="text-pri">$1</b>')
                .replace(/\n/g, '<br>');

              const updatedHtml = baseHtml.replace(
                '<div id="wrt-ai-detail-slot" class="hidden text-xs leading-relaxed pt-2 border-t border-line/50"></div>',
                `<div id="wrt-ai-detail-slot" class="text-xs leading-relaxed pt-2 border-t border-line/50 space-y-1"><b class="text-pri">Nhận xét bổ sung từ AI:</b><div>${cleanAi}</div></div>`
              );
              tState.sentences[targetIdx].feedback = updatedHtml;
              global.LexiAcademy.saveState();
              if (tState.activeIdx === targetIdx) {
                global.LexiAcademy.render();
              }
            }
          } catch (e) {
            // Không hiển thị thông báo treo nếu không có mạng hoặc chưa cấu hình khóa AI
          }
        }
      };
    }

    // Nghe toàn bộ bài viết đã ghép
    const speakFullBtn = container.querySelector('#wrt-speak-full');
    if (speakFullBtn) {
      speakFullBtn.onclick = () => {
        const fullTxt = item.sentences
          .map((_, idx) =>
            tState.sentences[idx] && tState.sentences[idx].text ? tState.sentences[idx].text.trim() : ''
          )
          .filter(Boolean)
          .join(' ');
        if (!fullTxt) {
          global.LexiAcademy.notify('Chưa có câu nào để đọc.');
          return;
        }
        if (typeof global.speakUS === 'function') global.speakUS(fullTxt);
        else if (typeof global.speak === 'function') global.speak(fullTxt);
      };
    }

    // Sao chép bài viết
    const copyFullBtn = container.querySelector('#wrt-copy-full');
    if (copyFullBtn) {
      copyFullBtn.onclick = () => {
        const fullTxt = item.sentences
          .map((_, idx) =>
            tState.sentences[idx] && tState.sentences[idx].text ? tState.sentences[idx].text.trim() : ''
          )
          .filter(Boolean)
          .join(' ');
        if (!fullTxt) {
          global.LexiAcademy.notify('Chưa có câu nào để sao chép.');
          return;
        }
        if (navigator.clipboard) {
          navigator.clipboard.writeText(fullTxt);
          global.LexiAcademy.notify('Đã sao chép bài viết.');
        }
      };
    }
  }

  function getItems(lv) {
    return WRITING_DATA[lv] || [];
  }

  if (global.LexiAcademy) {
    global.LexiAcademy.registerModule('writing', { render, bind, getItems });
  }
})(window);
