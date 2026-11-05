/**
 * LexiContext Academy — Module Luyện Viết (academy-writing.js)
 * Thiết kế tối giản, tập trung thực hành:
 * - Cột trái: Dàn bài tiếng Việt (hiệu ứng sáng câu đang viết)
 * - Cột phải: Ô viết câu tiếng Anh + Gợi ý ẩn mặc định + Đánh giá chi tiết ngữ pháp/từ vựng từng câu (không lộ sẵn đáp án)
 */
(function (global) {
  'use strict';

  const WRITING_DATA = {
    B1: [
      {
        id: 'vstep_b1_email_info',
        type: 'Task 1 • Viết thư (Email)',
        title: '1. Thư trả lời bạn nước ngoài (Jane hỏi về người bạn An)',
        prompt: 'You received an email from your English friend, Jane. She asked you for some information about one of your friends, An, who wants to stay with Jane’s family in London this summer (personality, hobbies/interests, current work/study). Write an email (at least 120 words) responding to Jane.',
        formulaNote: 'Chào hỏi → Hỏi thăm + Nêu mục đích (I am writing this email to...) → Trả lời 3 ý (First of all / Secondly / Finally) → Kết thư.',
        sentences: [
          {
            section: 'Phần 1: Mở đầu',
            vn: 'Chào Jane, dạo này bạn thế nào? Mình vẫn khỏe và hy vọng bạn cùng gia đình cũng đều khỏe mạnh.',
            structure: 'Dear + Tên, How is it going? I am doing well and I hope you and your family are doing well too.',
            keywords: ['Dear Jane', 'How is it going', 'hope you'],
            grammarRules: [
              {
                check: (s) => /\bdear\s+jane\b/i.test(s),
                rule: 'Lời chào đầu thư thân mật: "Dear Jane,".'
              },
              {
                check: (s) => /\b(how\s+is\s+it\s+going|how\s+are\s+you|hope\s+you)\b/i.test(s),
                rule: 'Câu hỏi thăm sức khỏe ở thì Hiện tại đơn: "How is it going?" hoặc "I hope you are doing well".'
              }
            ],
            commonErrors: [
              {
                pattern: /\bi\s+very\s+well\b|\bi\s+fine\b/i,
                fix: 'Thiếu động từ to be: Sửa thành "I am doing well" hoặc "I am fine".'
              }
            ],
            sample: 'Dear Jane, How is it going? I am doing well and I hope you and your family are doing well too.'
          },
          {
            section: 'Phần 1: Mở đầu',
            vn: 'Mình viết bức thư điện tử này để trả lời các câu hỏi của bạn về cô bạn thân của mình là An, người sẽ sang London vào mùa hè này.',
            structure: 'I am writing this email to + V0 (answer your questions about...) + my best friend, An, who is going to + địa điểm + thời gian.',
            keywords: ['I am writing this email to', 'answer your questions', 'who is going to'],
            grammarRules: [
              {
                check: (s) => /\b(i\s+am\s+writing|i'm\s+writing)\b/i.test(s),
                rule: 'Dùng thì Hiện tại tiếp diễn "I am writing this email to + V0" để nêu mục đích viết thư ngay lúc này (không dùng quá khứ "I wrote").'
              },
              {
                check: (s) => /\bwho\s+is\s+going\s+to\b|\bwho\s+will\b/i.test(s),
                rule: 'Dùng mệnh đề quan hệ "who is going to London" nối trực tiếp sau tên "An," (không tách thành "her name is An, Who...").'
              },
              {
                check: (s) => !/\bin\s+this\s+summer\b/i.test(s),
                rule: 'Trước các từ "this / next / last + mùa/tháng/tuần" KHÔNG dùng giới từ "in": Viết "this summer" (bỏ "in").'
              }
            ],
            commonErrors: [
              {
                pattern: /\bi\s+wrote\s+this\b/i,
                fix: 'Sai thì động từ: Bạn viết "I wrote" (quá khứ). Khi đang viết thư cần dùng Hiện tại tiếp diễn: "I am writing this email to...".'
              },
              {
                pattern: /\bquestion\s+about\b/i,
                fix: 'Danh từ số nhiều: Đề bài có nhiều câu hỏi nên dùng "questions" (thêm -s): "answer your questions about...".'
              },
              {
                pattern: /\bher\s+name\s+is\s+an\s*,?\s*who\b/i,
                fix: 'Lỗi cấu trúc mệnh đề: Thay vì viết "my best friend, her name is An, who...", hãy dùng đồng位 ngữ gọn chuẩn: "my best friend, An, who is going to...".'
              },
              {
                pattern: /\bin\s+this\s+summer\b/i,
                fix: 'Thừa giới từ "in": Trước "this summer" không dùng "in". Hãy viết trực tiếp là "this summer".'
              }
            ],
            sample: 'I am writing this email to answer your questions about my close friend, An, who is going to London this summer.'
          },
          {
            section: 'Phần 2: Nội dung chính',
            vn: 'Trước hết, về tính cách của An, cô ấy là một người rất hòa đồng, tốt bụng và luôn sẵn lòng giúp đỡ mọi người xung quanh.',
            structure: 'First of all, regarding her personality, she is + adj (sociable, kind-hearted) + and always willing to help others.',
            keywords: ['First of all', 'sociable', 'kind', 'willing to help'],
            grammarRules: [
              {
                check: (s) => /\b(first\s+of\s+all|firstly|first)\b/i.test(s),
                rule: 'Có từ nối mở đầu ý thứ nhất: "First of all," hoặc "Firstly,".'
              },
              {
                check: (s) => /\bshe\s+is\b/i.test(s),
                rule: 'Dùng động từ to be "she is" đi trước các tính từ chỉ tính cách (sociable, friendly, kind-hearted).'
              }
            ],
            commonErrors: [
              {
                pattern: /\bshe\s+very\s+(sociable|kind|friendly)\b/i,
                fix: 'Thiếu động từ to be: Cần viết "she is very sociable..." chứ không viết "she very sociable".'
              },
              {
                pattern: /\bhelp\s+people\s+around\s+she\b/i,
                fix: 'Sai đại từ tân ngữ: Sau giới từ "around" dùng "her" (around her), không dùng "she".'
              }
            ],
            sample: 'First of all, regarding her personality, she is very sociable, kind-hearted, and always willing to help people around her.'
          },
          {
            section: 'Phần 2: Nội dung chính',
            vn: 'Thứ hai, về sở thích cá nhân, cô ấy rất thích đọc sách tiếng Anh, nấu các món ăn truyền thống Việt Nam và chụp ảnh.',
            structure: 'Secondly / What is more, when it comes to her hobbies, she is keen on / enjoys + V-ing, V-ing, and V-ing.',
            keywords: ['Secondly', 'What is more', 'hobbies', 'reading', 'cooking'],
            grammarRules: [
              {
                check: (s) => /\b(secondly|what\s+is\s+more|moreover|besides)\b/i.test(s),
                rule: 'Có từ nối chuyển sang ý thứ hai: "Secondly," hoặc "What is more,".'
              },
              {
                check: (s) => /\b(reading|cooking|taking)\b/i.test(s),
                rule: 'Cấu trúc song song (Parallel structure): Sau "enjoy / like / keen on / fond of", các động từ liệt kê đều phải thêm "-ing" (reading..., cooking..., and taking...).'
              }
            ],
            commonErrors: [
              {
                pattern: /\b(keen\s+on|fond\s+of|enjoy|enjoys)\s+(read|cook|take)\b/i,
                fix: 'Sai dạng động từ: Sau "enjoy / keen on / fond of" động từ phải ở dạng V-ing (reading, cooking, taking).'
              }
            ],
            sample: 'What is more, when it comes to her hobbies, she is keen on reading English books, cooking traditional Vietnamese food, and taking photos.'
          },
          {
            section: 'Phần 2: Nội dung chính',
            vn: 'Cuối cùng, hiện tại cô ấy đang là sinh viên năm cuối tại một trường đại học và học tập vô cùng chăm chỉ.',
            structure: 'Finally / Last but not least, she is currently a final-year university student and studies very hard.',
            keywords: ['Finally', 'Last but not least', 'currently', 'final-year', 'student'],
            grammarRules: [
              {
                check: (s) => /\b(finally|last\s+but\s+not\s+least|lastly)\b/i.test(s),
                rule: 'Có từ nối mở đầu ý cuối cùng: "Finally," hoặc "Last but not least,".'
              },
              {
                check: (s) => /\b(studies|works)\s+(very\s+)?hard\b/i.test(s),
                rule: 'Chia động từ ngôi thứ 3 số ít theo chủ ngữ "she": "studies very hard" (trạng từ "hard" giữ nguyên, không dùng "hardly").'
              }
            ],
            commonErrors: [
              {
                pattern: /\bshe\s+study\b/i,
                fix: 'Lỗi chia động từ: Chủ ngữ "she" ở thì Hiện tại đơn cần chia động từ là "studies" (đổi y -> ies).'
              },
              {
                pattern: /\bhardly\b/i,
                fix: 'Sai từ vựng: "hardly" nghĩa là "hầu như không". Học chăm chỉ phải dùng trạng từ "hard" (studies very hard).'
              }
            ],
            sample: 'Last but not least, she is currently a final-year student at a local university and studies very hard.'
          },
          {
            section: 'Phần 3: Kết thư',
            vn: 'Mình chắc chắn rằng An sẽ hòa nhập rất tốt với gia đình của bạn. Cảm ơn bạn đã đọc thư và mình rất mong sớm nhận được hồi âm từ bạn. Thân mến, Annie.',
            structure: 'I am sure she will fit in well with your family. Thank you for reading my email. I am looking forward to hearing from you soon. Best regards, Annie.',
            keywords: ['fit in', 'looking forward to hearing from you', 'Best regards'],
            grammarRules: [
              {
                check: (s) => /\blooking\s+forward\s+to\s+hearing\b|\blook\s+forward\s+to\s+hearing\b/i.test(s),
                rule: 'Cấu trúc kết thư: "look forward to + V-ing" (hearing from you soon).'
              },
              {
                check: (s) => /\b(best\s+regards|best\s+wishes|warm\s+regards)\b/i.test(s),
                rule: 'Có lời chào kết thư: "Best regards," hoặc "Best wishes,".'
              }
            ],
            commonErrors: [
              {
                pattern: /\blooking\s+forward\s+to\s+hear\b|\blook\s+forward\s+to\s+hear\b/i,
                fix: 'Lỗi ngữ pháp kinh điển: Trong cụm "look forward to", chữ "to" là giới từ nên theo sau phải là V-ing ("hearing"), không dùng "hear" nguyên mẫu.'
              }
            ],
            sample: 'I am sure she will fit in well with your family. Thank you for reading my email. I am looking forward to hearing from you soon. Best regards, Annie.'
          }
        ]
      },
      {
        id: 'vstep_b1_email_advice',
        type: 'Task 1 • Viết thư (Email)',
        title: '2. Thư khuyên bạn cách cải thiện sức khỏe & giảm căng thẳng',
        prompt: 'Your friend Alex wrote an email saying he feels exhausted and stressed because of studying late and eating fast food. Write an email (at least 120 words) to give him some advice on how to stay healthy and study effectively.',
        formulaNote: 'Hỏi thăm → Nêu mục đích khuyên (give you some advice) → 3 lời khuyên (If I were you / I suggest that / It would be a good idea) → Kết thư.',
        sentences: [
          {
            section: 'Phần 1: Mở đầu',
            vn: 'Chào Alex, mọi việc thế nào rồi? Mình rất tiếc khi nghe về những vấn đề căng thẳng và mệt mỏi của bạn dạo gần đây.',
            structure: 'Dear Alex, How is it going? I was sorry to hear about your stress and exhaustion recently.',
            keywords: ['Dear Alex', 'sorry to hear about', 'stress'],
            grammarRules: [
              {
                check: (s) => /\bsorry\s+to\s+hear\s+about\b/i.test(s),
                rule: 'Cấu trúc chia sẻ đầu thư: "I was sorry to hear about + cụm danh từ".'
              }
            ],
            commonErrors: [],
            sample: 'Dear Alex, How is it going? I was really sorry to hear about your health problems and stress recently.'
          },
          {
            section: 'Phần 1: Mở đầu',
            vn: 'Mình viết bức thư này để đưa cho bạn một vài lời khuyên hữu ích giúp bạn vượt qua giai đoạn khó khăn này.',
            structure: 'I am writing this email to give you some useful advice about your problem.',
            keywords: ['I am writing this email to', 'give you some', 'advice'],
            grammarRules: [
              {
                check: (s) => /\badvice\b/i.test(s) && !/\badvices\b/i.test(s),
                rule: '"Advice" là danh từ KHÔNG đếm được (không thêm -s, không dùng "an advice", chỉ dùng "some advice").'
              }
            ],
            commonErrors: [
              {
                pattern: /\badvices\b|\ban\s+advice\b/i,
                fix: 'Lỗi danh từ không đếm được: "advice" không có dạng số nhiều "advices" và không đi với "an". Hãy dùng "some useful advice".'
              }
            ],
            sample: 'I am writing this email to give you some useful advice so that you can overcome this difficult time.'
          },
          {
            section: 'Phần 2: Lời khuyên',
            vn: 'Trước hết, nếu mình là bạn, mình sẽ ngừng ăn đồ ăn nhanh và bắt đầu nấu các bữa ăn lành mạnh có nhiều rau xanh và trái cây.',
            structure: 'First of all, if I were you, I would stop + V-ing (eating fast food) and start + V-ing (cooking healthy meals).',
            keywords: ['First of all', 'if I were you', 'I would stop', 'healthy meals'],
            grammarRules: [
              {
                check: (s) => /\bif\s+i\s+were\s+you\s*,\s*i\s+would\b/i.test(s),
                rule: 'Câu điều kiện loại 2 dùng để khuyên nhủ: "If I were you, I would + V0".'
              },
              {
                check: (s) => /\bstop\s+eating\b/i.test(s),
                rule: 'Cấu trúc "stop + V-ing" (dừng hẳn việc đang làm): "stop eating fast food".'
              }
            ],
            commonErrors: [
              {
                pattern: /\bstop\s+to\s+eat\b/i,
                fix: 'Sai cấu trúc: "stop to eat" là dừng việc khác lại để ăn. Muốn nói "ngừng ăn đồ ăn nhanh" phải dùng "stop + V-ing" -> "stop eating fast food".'
              }
            ],
            sample: 'First of all, if I were you, I would stop eating fast food and start cooking healthy meals with vegetables and fruit.'
          },
          {
            section: 'Phần 2: Lời khuyên',
            vn: 'Hơn thế nữa, mình muốn đề xuất rằng bạn nên lập một thời gian biểu học tập hợp lý và đi ngủ trước 11 giờ đêm mỗi ngày.',
            structure: 'What is more, I would like to suggest that you (should) + V0 (make a reasonable study schedule and go to bed before 11 p.m.).',
            keywords: ['What is more', 'suggest that you', 'schedule', 'go to bed'],
            grammarRules: [
              {
                check: (s) => /\bsuggest\s+that\s+you\b/i.test(s),
                rule: 'Cấu trúc giả định với suggest: "I would like to suggest that you + V0".'
              }
            ],
            commonErrors: [
              {
                pattern: /\bsuggest\s+you\s+to\b/i,
                fix: 'Lỗi cấu trúc: Động từ "suggest" KHÔNG đi với "somebody to V". Hãy sửa thành "suggest that you + V0".'
              }
            ],
            sample: 'What is more, I would like to suggest that you make a reasonable study schedule and go to bed before 11 p.m. every day.'
          },
          {
            section: 'Phần 2: Lời khuyên',
            vn: 'Cuối cùng, sẽ là một ý kiến rất hay khi bạn dành 30 phút mỗi ngày để chạy bộ hoặc nghe nhạc nhẹ nhằm giải tỏa áp lực.',
            structure: 'Finally, it would be a good idea if/when you spend 30 minutes a day + V-ing (jogging or listening to music) to reduce stress.',
            keywords: ['Finally', 'good idea', 'spend', 'jogging', 'reduce stress'],
            grammarRules: [
              {
                check: (s) => /\bspend\b.+\b(jogging|running|listening|exercising)\b/i.test(s),
                rule: 'Cấu trúc dành thời gian: "spend + thời gian + V-ing" (spend 30 minutes jogging).'
              }
            ],
            commonErrors: [
              {
                pattern: /\bspend\s+30\s+minutes\s+(a\s+day\s+)?to\s+(jog|run|listen)\b/i,
                fix: 'Sai cấu trúc "spend": Sau "spend + thời gian" phải dùng V-ing (jogging / listening), không dùng "to V".'
              }
            ],
            sample: 'Finally, it would be a good idea if you spend 30 minutes a day jogging or listening to soft music to reduce stress.'
          },
          {
            section: 'Phần 3: Kết thư',
            vn: 'Đừng lo lắng quá nhé, mọi chuyện rồi sẽ ổn thôi! Mình hy vọng lời khuyên của mình sẽ giúp ích cho bạn. Viết thư lại cho mình sớm nhé. Thân ái, Annie.',
            structure: 'Do not worry! Everything will be okay. I hope my advice can help you. Write to me soon. Best wishes, Annie.',
            keywords: ['Everything will be okay', 'hope my advice', 'Best wishes'],
            grammarRules: [
              {
                check: (s) => /\b(best\s+wishes|best\s+regards)\b/i.test(s),
                rule: 'Kết thư thân mật có lời chúc "Best wishes," hoặc "Best regards,".'
              }
            ],
            commonErrors: [],
            sample: 'Do not worry! Everything will be okay. I hope my advice can help you overcome the problem. Write to me soon. Best wishes, Annie.'
          }
        ]
      },
      {
        id: 'vstep_b1_email_complaint',
        type: 'Task 1 • Viết thư (Email)',
        title: '3. Thư phàn nàn về sản phẩm mua online bị lỗi',
        prompt: 'You bought a laptop online from a store last week, but when it arrived, the screen was scratched and the battery did not work properly. Write an email (at least 120 words) to the store manager to complain about the product and ask for a solution.',
        formulaNote: 'Dear Sir or Madam → Mục đích (complain about...) → Sự cố (However...) → Hậu quả (Therefore...) → Yêu cầu giải pháp (replace / refund) → Yours faithfully.',
        sentences: [
          {
            section: 'Phần 1: Mở đầu',
            vn: 'Kính gửi Quý Ông/Bà, tôi viết bức thư điện tử này để phàn nàn về chiếc máy tính xách tay mà tôi đã mua từ cửa hàng trực tuyến của quý công ty vào tuần trước.',
            structure: 'Dear Sir or Madam, I am writing this email to complain about the laptop that I bought from your online store last week.',
            keywords: ['Dear Sir or Madam', 'I am writing this email to complain about', 'last week'],
            grammarRules: [
              {
                check: (s) => /\bdear\s+sir\s+or\s+madam\b/i.test(s),
                rule: 'Thư trang trọng mở đầu bằng "Dear Sir or Madam,".'
              },
              {
                check: (s) => /\b(bought|purchased|ordered)\b/i.test(s),
                rule: 'Mệnh đề phụ có "last week" nên động từ mua phải chia Quá khứ đơn (bought / purchased / ordered).'
              }
            ],
            commonErrors: [
              {
                pattern: /\bi\s+buy\b.+last\s+week/i,
                fix: 'Sai thì động từ: Có "last week" (tuần trước) nên động từ "buy" phải đổi sang quá khứ là "bought" hoặc "purchased".'
              }
            ],
            sample: 'Dear Sir or Madam, I am writing this email to complain about the laptop that I bought from your online store last week.'
          },
          {
            section: 'Phần 2: Vấn đề & Hậu quả',
            vn: 'Khi tôi nhận được hàng vào hôm qua, tôi vô cùng thất vọng vì màn hình bị trầy xước và pin không hoạt động bình thường.',
            structure: 'When I received the package yesterday, I was very disappointed because the screen was scratched and the battery did not work properly.',
            keywords: ['received', 'disappointed', 'screen was scratched', 'battery did not work'],
            grammarRules: [
              {
                check: (s) => /\b(was\s+disappointed|felt\s+disappointed)\b/i.test(s),
                rule: 'Tính từ chỉ cảm xúc của người dùng đuôi "-ed": "I was disappointed" (không dùng "disappointing").'
              }
            ],
            commonErrors: [
              {
                pattern: /\bi\s+was\s+disappointing\b/i,
                fix: 'Sai tính từ đuôi -ing/-ed: Chỉ cảm xúc con người phải dùng "-ed" -> "I was very disappointed".'
              }
            ],
            sample: 'When I received the package yesterday, I was very disappointed because the screen was scratched and the battery did not work properly.'
          },
          {
            section: 'Phần 2: Vấn đề & Hậu quả',
            vn: 'Do đó, sự cố này đã làm gián đoạn nghiêm trọng công việc hàng ngày cũng như việc học trực tuyến của tôi.',
            structure: 'Therefore / As a result, this problem has seriously affected my daily work and online study.',
            keywords: ['Therefore', 'As a result', 'daily work', 'online study'],
            grammarRules: [
              {
                check: (s) => /\b(therefore|as\s+a\s+result|consequently)\b/i.test(s),
                rule: 'Dùng từ nối chỉ kết quả: "Therefore," hoặc "As a result,".'
              }
            ],
            commonErrors: [],
            sample: 'Therefore, this problem has seriously disrupted my daily work and online study.'
          },
          {
            section: 'Phần 3: Yêu cầu giải quyết',
            vn: 'Vì sản phẩm này vẫn còn trong thời hạn bảo hành, tôi muốn yêu cầu quý cửa hàng đổi cho tôi một chiếc máy mới hoặc hoàn lại toàn bộ số tiền.',
            structure: 'Because this product is still under warranty, I would like to request that you replace it with a new one or give me a full refund.',
            keywords: ['under warranty', 'replace', 'full refund'],
            grammarRules: [
              {
                check: (s) => /\bunder\s+warranty\b/i.test(s),
                rule: 'Cụm từ cố định "trong thời gian bảo hành": "under warranty".'
              },
              {
                check: (s) => /\bfull\s+refund\b/i.test(s),
                rule: 'Cụm từ "hoàn lại toàn bộ tiền": "give me a full refund".'
              }
            ],
            commonErrors: [],
            sample: 'Since this product is still under warranty, I would like to request that you replace it with a new one or give me a full refund.'
          },
          {
            section: 'Phần 4: Kết thư',
            vn: 'Tôi hy vọng quý vị sẽ xem xét và giải quyết vấn đề này sớm nhất có thể. Tôi rất mong sớm nhận được phản hồi từ quý vị. Trân trọng, Annie.',
            structure: 'I hope that you will solve this issue as soon as possible. I am looking forward to hearing from you soon. Yours faithfully, Annie.',
            keywords: ['as soon as possible', 'looking forward to hearing from you', 'Yours faithfully'],
            grammarRules: [
              {
                check: (s) => /\byours\s+faithfully\b|\byours\s+sincerely\b/i.test(s),
                rule: 'Kết thư trang trọng: "Yours faithfully,".'
              }
            ],
            commonErrors: [],
            sample: 'I hope that you will solve this issue as soon as possible. I am looking forward to hearing from you soon. Yours faithfully, Annie.'
          }
        ]
      },
      {
        id: 'vstep_b1_email_application',
        type: 'Task 1 • Viết thư (Email)',
        title: '4. Thư ứng tuyển vị trí việc làm (Application Letter)',
        prompt: 'You saw an advertisement on the internet for a part-time tour guide position. Write an email (at least 120 words) to apply for this job, mentioning your education, work experience, skills, and why you want the job.',
        formulaNote: 'Dear Sir or Madam → Nêu vị trí ứng tuyển (apply for the position of...) → Học vấn & Kinh nghiệm → Kỹ năng (not only... but also...) → Lý do → Yours sincerely.',
        sentences: [
          {
            section: 'Phần 1: Mở đầu',
            vn: 'Kính gửi Quý Ông/Bà, tôi viết thư này để ứng tuyển vào vị trí hướng dẫn viên du lịch bán thời gian như được đăng tuyển trên trang web của quý công ty.',
            structure: 'Dear Sir or Madam, I am writing this email to apply for the position of a part-time tour guide as advertised on your website.',
            keywords: ['Dear Sir or Madam', 'apply for the position of', 'advertised'],
            grammarRules: [
              {
                check: (s) => /\bapply\s+for\b/i.test(s),
                rule: 'Động từ ứng tuyển vào vị trí: "apply for the position of...".'
              }
            ],
            commonErrors: [],
            sample: 'Dear Sir or Madam, I am writing this email to apply for the position of a part-time tour guide as advertised on your website.'
          },
          {
            section: 'Phần 2: Học vấn & Kinh nghiệm',
            vn: 'Trước hết, tôi hiện là sinh viên năm ba tại trường đại học Cần Thơ và tôi đã có hơn hai năm kinh nghiệm làm việc trong lĩnh vực dịch vụ khách hàng.',
            structure: 'First of all, I am a third-year student at Can Tho University, and I have over two years of experience in customer service.',
            keywords: ['First of all', 'third-year student', 'experience', 'customer service'],
            grammarRules: [
              {
                check: (s) => /\bthird-year\s+student\b|\bstudent\b/i.test(s),
                rule: 'Tính từ ghép chỉ năm học không thêm -s: "a third-year student".'
              }
            ],
            commonErrors: [
              {
                pattern: /\bthree\s+years\s+student\b|\bthird\s+years\s+student\b/i,
                fix: 'Khi đứng trước danh từ "student", cụm chỉ số năm không thêm -s: viết là "a third-year student".'
              }
            ],
            sample: 'First of all, I am currently a third-year student at Can Tho University, and I have two years of experience in customer service.'
          },
          {
            section: 'Phần 2: Kỹ năng & Thế mạnh',
            vn: 'Thêm vào đó, tôi không chỉ năng động, hòa đồng mà còn giao tiếp tiếng Anh rất trôi chảy, vì vậy tôi có thể làm việc hiệu quả với nhiều người.',
            structure: 'Besides, I am not only outgoing and sociable, but also good at speaking English fluently; thus, I can work well with many kinds of people.',
            keywords: ['Besides', 'not only', 'but also', 'outgoing', 'sociable'],
            grammarRules: [
              {
                check: (s) => /\bnot\s+only\b.+\bbut\s+also\b/i.test(s),
                rule: 'Cấu trúc liên từ tương quan: "not only ... but also ..." (không những ... mà còn ...).'
              }
            ],
            commonErrors: [],
            sample: 'Besides, I am not only outgoing and sociable, but also good at speaking English fluently; thus, I can work well with many kinds of people.'
          },
          {
            section: 'Phần 2: Lý do ứng tuyển',
            vn: 'Lý do tôi muốn ứng tuyển vào vị trí này là vì tôi mong muốn trau dồi kỹ năng giao tiếp và có một công việc ổn định để phụ giúp gia đình.',
            structure: 'The reason why I would like to apply for this position is that I want to improve my communication skills and have a stable job to help my parents.',
            keywords: ['The reason why', 'improve', 'communication skills', 'stable job'],
            grammarRules: [
              {
                check: (s) => /\bthe\s+reason\s+why\b.+\bis\s+that\b/i.test(s),
                rule: 'Cấu trúc nêu lý do: "The reason why S + V is that S + V" (không dùng "The reason why ... is because ...").'
              }
            ],
            commonErrors: [
              {
                pattern: /\bthe\s+reason\b.+\bis\s+because\b/i,
                fix: 'Lỗi lặp ngữ pháp: Đã dùng "The reason why" thì phía sau dùng "is that S + V", không dùng "is because".'
              }
            ],
            sample: 'The reason why I would like to apply for this position is that I want to improve my communication skills and have a stable job to support my parents.'
          },
          {
            section: 'Phần 3: Kết thư',
            vn: 'Cảm ơn quý vị đã dành thời gian xem xét hồ sơ của tôi. Tôi rất mong sớm nhận được phản hồi từ quý công ty. Trân trọng, Annie.',
            structure: 'Thank you for your time and consideration. I look forward to hearing from you soon. Yours sincerely, Annie.',
            keywords: ['look forward to hearing from you', 'Yours sincerely'],
            grammarRules: [
              {
                check: (s) => /\blook(ing)?\s+forward\s+to\s+hearing\b/i.test(s),
                rule: 'Cấu trúc "look forward to + V-ing".'
              }
            ],
            commonErrors: [],
            sample: 'Thank you for your time and consideration. I look forward to hearing from you soon. Yours sincerely, Annie.'
          }
        ]
      }
    ],
    B2: [
      {
        id: 'vstep_b2_essay_internet',
        type: 'Task 2 • Viết luận (Benefits & Drawbacks)',
        title: '1. Thuận lợi và Bất lợi của Internet',
        prompt: 'The Internet has brought about many changes into our day-to-day life. Nowadays we are doing things such as mailing, contacting, banking and communication much faster. Do these developments have more advantages than disadvantages? Write an essay of at least 250 words.',
        formulaNote: 'Mở bài (Giới thiệu chủ đề + This essay will discuss both merits and demerits) → Thân bài 1 (On the one hand: Merits) → Thân bài 2 (On the other hand: Demerits) → Kết bài.',
        sentences: [
          {
            section: 'Đoạn 1: Mở bài',
            vn: 'Trong kỷ nguyên toàn cầu hóa ngày nay, mạng Internet đang ngày càng trở nên phổ biến và đóng vai trò quan trọng trong đời sống hàng ngày của chúng ta.',
            structure: 'In the era of globalization, the Internet is becoming more and more popular and plays an important role in our daily lives.',
            keywords: ['era of globalization', 'Internet', 'popular', 'daily lives'],
            grammarRules: [
              {
                check: (s) => /\b(plays|has)\s+an?\s+(important|vital|essential)\s+role\b/i.test(s) || /\bbecoming\s+more\s+and\s+more\s+popular\b/i.test(s),
                rule: 'Cấu trúc mở bài học thuật: "In the era of globalization, S + plays an important role in...".'
              }
            ],
            commonErrors: [
              {
                pattern: /\btends\s+to\s+more\s+and\s+more\s+popular\b/i,
                fix: 'Thiếu động từ nguyên mẫu sau "tends to": Phải viết là "tends to become more and more popular".'
              }
            ],
            sample: 'In the era of globalization, the Internet tends to become more and more popular and plays an essential role in our daily lives.'
          },
          {
            section: 'Đoạn 1: Mở bài',
            vn: 'Tuy nhiên, tôi giữ niềm tin vững chắc rằng xu hướng này mang lại cả những mặt thuận lợi lẫn bất lợi. Bài tiểu luận này sẽ thảo luận cả ưu điểm và nhược điểm của vấn đề này.',
            structure: 'However, I hold a firm belief that this trend brings both pros and cons. This essay will discuss both the merits and demerits of this trend.',
            keywords: ['However', 'both pros and cons', 'This essay will discuss', 'merits and demerits'],
            grammarRules: [
              {
                check: (s) => /\bthis\s+essay\s+will\s+discuss\b/i.test(s),
                rule: 'Câu định hướng bài viết (Thesis statement): "This essay will discuss both the merits and demerits of...".'
              }
            ],
            commonErrors: [],
            sample: 'However, I hold a firm belief that this trend brings both pros and cons. This essay will discuss both the merits and demerits of using the Internet.'
          },
          {
            section: 'Đoạn 2: Thân bài 1 (Mặt thuận lợi)',
            vn: 'Một mặt, việc sử dụng Internet có thể mang lại vô số lợi ích to lớn. Thuận lợi đầu tiên là nó là một phương tiện giải trí tuyệt vời.',
            structure: 'On the one hand, using the Internet can offer tremendous advantages. Firstly, it is a great means of entertainment.',
            keywords: ['On the one hand', 'advantages', 'Firstly', 'means of entertainment'],
            grammarRules: [
              {
                check: (s) => /\bon\s+the\s+one\s+hand\b/i.test(s),
                rule: 'Mở đầu đoạn thuận lợi bằng cụm liên từ: "On the one hand,".'
              },
              {
                check: (s) => /\bmeans\s+of\s+entertainment\b/i.test(s),
                rule: 'Cụm danh từ học thuật: "a great means of entertainment" (một phương tiện giải trí tuyệt vời).'
              }
            ],
            commonErrors: [],
            sample: 'On the one hand, using the Internet can offer tremendous advantages. Firstly, it is a great means of entertainment.'
          },
          {
            section: 'Đoạn 2: Thân bài 1 (Giải thích & Kết quả)',
            vn: 'Nói cách khác, mọi người có xu hướng nghe nhạc, chơi trò chơi trực tuyến hoặc xem các video giải trí; nhờ vậy, họ có thể thư giãn sau giờ học và có thêm năng lượng tích cực để làm việc hiệu quả.',
            structure: 'In other words, people tend to listen to music, play online games, or watch videos; thus, they can unwind after school and have more positive energy to work effectively.',
            keywords: ['In other words', 'tend to', 'thus', 'unwind', 'effectively'],
            grammarRules: [
              {
                check: (s) => /\b(in\s+other\s+words|this\s+means\s+that)\b/i.test(s),
                rule: 'Cụm giải thích mở rộng ý: "In other words, S + V".'
              },
              {
                check: (s) => /\b(thus|therefore|as\s+a\s+result)\b/i.test(s),
                rule: 'Cụm nêu kết quả: "Thus, / Therefore, S + V".'
              }
            ],
            commonErrors: [],
            sample: 'In other words, people tend to listen to music, play online games, or watch entertaining videos; thus, they can unwind after school and have more positive energy to work effectively.'
          },
          {
            section: 'Đoạn 2: Thân bài 1 (Thuận lợi 2 + Ví dụ)',
            vn: 'Thứ hai, Internet là một nguồn thông tin khổng lồ. Điều này có nghĩa là con người có khả năng tìm kiếm thông tin giá trị cho công việc và học tập. Ví dụ, nếu người dùng muốn cải thiện kỹ năng tiếng Anh, họ có thể xem hàng loạt video trên YouTube hoàn toàn miễn phí.',
            structure: 'Secondly, the Internet is a great source of information. It means that people are capable of seeking valuable information. For example, if users want to boost their English skills, they can watch videos on YouTube for free.',
            keywords: ['Secondly', 'source of information', 'It means that', 'For example'],
            grammarRules: [
              {
                check: (s) => /\bsecondly\b/i.test(s) && /\bfor\s+(example|instance)\b/i.test(s),
                rule: 'Kết hợp đủ chuỗi: Nêu ý 2 (Secondly) → Giải thích (It means that) → Ví dụ (For example).'
              }
            ],
            commonErrors: [],
            sample: 'Secondly, the Internet is a great source of information. It means that people are capable of seeking valuable information for their work and study. For example, if Internet users want to boost their English skills, they can watch videos on YouTube for free.'
          },
          {
            section: 'Đoạn 3: Thân bài 2 (Mặt bất lợi)',
            vn: 'Mặt khác, có một số bất lợi rõ ràng của việc sử dụng Internet. Trước hết, nó có thể gây ra nhiều vấn đề đối với sự tương tác xã hội ngoài đời thực.',
            structure: 'On the other hand, there are several obvious disadvantages of using the Internet. First of all, it may cause several problems with social interaction.',
            keywords: ['On the other hand', 'disadvantages', 'First of all', 'social interaction'],
            grammarRules: [
              {
                check: (s) => /\bon\s+the\s+other\s+hand\b/i.test(s),
                rule: 'Mở đầu đoạn đối lập bằng: "On the other hand,".'
              }
            ],
            commonErrors: [],
            sample: 'On the other hand, there are several obvious disadvantages of using the Internet. First of all, the Internet may cause several problems with social interaction.'
          },
          {
            section: 'Đoạn 3: Thân bài 2 (Giải thích + Bất lợi 2)',
            vn: 'Nhiều người thích lướt Facebook hơn là gặp gỡ bạn bè; kết quả là điều này làm giảm sự tự tin khi giao tiếp trước đám đông. Thứ hai, lướt mạng rất tốn thời gian vì nhiều học sinh mải chơi game đến mức không còn đủ thời gian học tập.',
            structure: 'More people prefer surfing Facebook instead of meeting friends; as a result, it could decrease their confidence in public. Secondly, using the Internet is time-consuming because many students spend too much time playing online games instead of studying.',
            keywords: ['As a result', 'confidence', 'Secondly', 'time-consuming'],
            grammarRules: [
              {
                check: (s) => /\btime-consuming\b/i.test(s),
                rule: 'Tính từ ghép B2 chỉ sự tốn thời gian: "time-consuming".'
              }
            ],
            commonErrors: [],
            sample: 'More people prefer surfing Facebook instead of meeting friends; as a result, it could decrease their confidence to speak in public. Secondly, using the Internet is time-consuming because many students spend too much time playing online games instead of studying.'
          },
          {
            section: 'Đoạn 4: Kết bài',
            vn: 'Tóm lại, việc sử dụng Internet có cả lợi ích lẫn tác hại. Mặc dù nó có một vài nhược điểm, tôi tin chắc rằng chúng ta nên học cách tối đa hóa mặt tích cực cũng như giảm thiểu mặt tiêu cực.',
            structure: 'To sum up / In conclusion, there are both benefits and drawbacks of using the Internet. Although it has some disadvantages, I am convinced that we should learn how to maximize the advantages as well as minimize the disadvantages.',
            keywords: ['To sum up', 'In conclusion', 'Although', 'maximize', 'minimize'],
            grammarRules: [
              {
                check: (s) => /\b(to\s+sum\s+up|in\s+conclusion)\b/i.test(s),
                rule: 'Mở đầu kết bài bằng "To sum up," hoặc "In conclusion,".'
              }
            ],
            commonErrors: [
              {
                pattern: /\balthough\b.+\bbut\b/i,
                fix: 'Lỗi thừa liên từ: Trong tiếng Anh đã dùng "Although" ở vế đầu thì KHÔNG dùng "but" ở vế sau.'
              },
              {
                pattern: /\bwe\s+should\s+how\s+to\b/i,
                fix: 'Thiếu động từ chính sau "should": Hãy viết "we should learn how to maximize...".'
              }
            ],
            sample: 'To sum up, there are both benefits and drawbacks of using the Internet. Although the Internet has some disadvantages, I am convinced that we should learn how to maximize the advantages as well as minimize the disadvantages.'
          }
        ]
      },
      {
        id: 'vstep_b2_essay_braindrain',
        type: 'Task 2 • Viết luận (Causes & Solutions)',
        title: '2. Vấn đề Chảy máu chất xám (Brain Drain)',
        prompt: 'An increasing number of professionals, such as doctors and teachers, are leaving their own poorer countries to work in developed countries. What are the reasons behind this trend? What solutions can you suggest to deal with this situation? Write at least 250 words.',
        formulaNote: 'Mở bài (Giới thiệu Brain drain + Thesis) → Thân bài 1 (Nguyên nhân: Điều kiện làm việc & Lương thấp) → Thân bài 2 (Giải pháp: Chính phủ & Doanh nghiệp) → Kết bài.',
        sentences: [
          {
            section: 'Đoạn 1: Mở bài',
            vn: 'Thế giới đã thay đổi rất nhiều, tuy nhiên một số vấn đề tiêu cực đã xuất hiện mà một trong số đó là tình trạng chảy máu chất xám. Bài viết này sẽ thảo luận các nguyên nhân chính của hiện tượng chảy máu chất xám và đề xuất một số giải pháp để cải thiện tình hình.',
            structure: 'The world has changed a lot; nonetheless, brain drain has become a serious problem. This essay will discuss the main causes of brain drain and suggest some solutions to improve the situation.',
            keywords: ['brain drain', 'This essay will discuss', 'causes', 'solutions'],
            grammarRules: [
              {
                check: (s) => /\bbrain\s+drain\b/i.test(s),
                rule: 'Thuật ngữ chủ đề: "brain drain" (chảy máu chất xám).'
              }
            ],
            commonErrors: [],
            sample: 'The world has changed a lot; nonetheless, brain drain has become a serious problem. This essay will discuss the main causes related to brain drain and suggest some solutions to improve the situation.'
          },
          {
            section: 'Đoạn 2: Thân bài 1 (Nguyên nhân)',
            vn: 'Có một số nguyên nhân chính dẫn đến tình trạng chảy máu chất xám ở các nước đang phát triển. Nguyên nhân đầu tiên là điều kiện làm việc còn thiếu thốn vì nhiều cơ sở thiếu trang thiết bị và máy móc hiện đại.',
            structure: 'There are several major reasons why brain drain occurs. The first cause is poor working conditions because many companies lack modern machines and equipment.',
            keywords: ['major reasons', 'first cause', 'working conditions', 'modern'],
            grammarRules: [
              {
                check: (s) => /\black\b/i.test(s) && !/\black\s+of\s+modern\b/i.test(s),
                rule: 'Khi "lack" là động từ (companies lack modern machines) thì không đi với giới từ "of".'
              }
            ],
            commonErrors: [],
            sample: 'There are several major reasons why brain drain happens in developing countries. The first cause of this problem is poor working conditions because many companies lack modern machines and equipment.'
          },
          {
            section: 'Đoạn 2: Thân bài 1 (Nguyên nhân 2)',
            vn: 'Một nguyên nhân lớn khác là mức thu nhập thấp. Ví dụ, nhiều trí thức trẻ chỉ nhận được mức lương khiêm tốn mỗi tháng; do đó, họ không có đủ tài chính để trang trải chi phí sinh hoạt và lo cho con cái.',
            structure: 'Another major problem is the low salary. For example, many professionals only receive a modest income each month; hence, they do not have enough money to cover living expenses and support their children.',
            keywords: ['Another', 'low salary', 'For example', 'hence', 'living expenses'],
            grammarRules: [
              {
                check: (s) => /\banother\b/i.test(s),
                rule: 'Dùng "Another major cause/problem is..." để nêu nguyên nhân thứ hai.'
              }
            ],
            commonErrors: [],
            sample: 'Another major problem is the low salary. For example, many professionals only receive a modest income each month; hence, they do not have enough money to cover living expenses for their families.'
          },
          {
            section: 'Đoạn 3: Thân bài 2 (Giải pháp)',
            vn: 'Tuy nhiên, có một số giải pháp khả thi cho vấn đề này. Trước hết, chính phủ và các doanh nghiệp nên đầu tư nâng cấp điều kiện làm việc với các trang thiết bị hiện đại hơn cho nhân viên.',
            structure: 'Nevertheless, there are some possible solutions to these problems. First, the government and companies had better improve working conditions with more up-to-date equipment for employees.',
            keywords: ['solutions', 'First', 'government', 'improve', 'working conditions'],
            grammarRules: [
              {
                check: (s) => /\b(had\s+better|should|ought\s+to)\s+improve\b/i.test(s),
                rule: 'Cấu trúc đưa giải pháp: "S + should / ought to / had better + V0".'
              }
            ],
            commonErrors: [],
            sample: 'Nevertheless, there are some possible solutions to these main problems. First, the government and companies had better improve working conditions with more up-to-date computers and equipment for employees.'
          },
          {
            section: 'Đoạn 3: Thân bài 2 (Giải pháp 2)',
            vn: 'Thứ hai, các tổ chức cần tăng mức lương và chế độ đãi ngộ xứng đáng cho đội ngũ nhân sự giỏi để họ có thu nhập tốt hơn và yên tâm cống hiến.',
            structure: 'Secondly, companies ought to increase the salary and benefits of their skilled staff so that their lives can be better.',
            keywords: ['Secondly', 'ought to', 'increase', 'salary', 'so that'],
            grammarRules: [
              {
                check: (s) => /\bso\s+that\b/i.test(s),
                rule: 'Mệnh đề chỉ mục đích: "so that + S + can/will + V0".'
              }
            ],
            commonErrors: [],
            sample: 'Secondly, companies ought to increase the salary and financial benefits of their staff so that they can earn enough money and have a better life.'
          },
          {
            section: 'Đoạn 4: Kết bài',
            vn: 'Tóm lại, chảy máu chất xám là một vấn đề nghiêm trọng trong xã hội hiện nay. Nếu các giải pháp nêu trên được áp dụng đồng bộ, tình hình chắc chắn sẽ trở nên tốt đẹp hơn.',
            structure: 'To sum up, brain drain is a serious problem in our lives. If the solutions above are applied, the situation will be better.',
            keywords: ['To sum up', 'In conclusion', 'If the solutions above are applied'],
            grammarRules: [
              {
                check: (s) => /\bif\s+the\s+solutions\s+above\s+are\s+applied\b/i.test(s),
                rule: 'Câu điều kiện loại 1 ở thể bị động dùng cho kết bài: "If the solutions above are applied, the situation will be better."'
              }
            ],
            commonErrors: [],
            sample: 'To sum up, brain drain is a serious problem in our lives. If the solutions above are applied, the situation will be better.'
          }
        ]
      },
      {
        id: 'vstep_b2_essay_vocational',
        type: 'Task 2 • Viết luận (Opinion 50/50)',
        title: '3. Học Đại học hay Trường nghề (Vocational Training)',
        prompt: 'Too much emphasis is placed on going to university for academic study. People should be encouraged to do vocational training because there is a lack of qualified tradespeople such as electricians or plumbers. To what extent do you agree or disagree?',
        formulaNote: 'Mở bài (I partly agree...) → Thân bài 1 (On the one hand: Lợi ích học Đại học) → Thân bài 2 (On the other hand: Lý do khuyến khích Trường nghề) → Kết bài.',
        sentences: [
          {
            section: 'Đoạn 1: Mở bài',
            vn: 'Đúng là việc vào đại học để theo đuổi con đường học thuật đóng vai trò quan trọng đối với nhiều bạn trẻ. Tuy nhiên, theo quan điểm của tôi, tôi đồng ý một phần với ý kiến này vì chúng ta cũng nên khuyến khích nhiều người tham gia đào tạo nghề.',
            structure: 'It is true that entering university for academic study plays an important role for young people. From my point of view, I partly agree with this opinion because we should also encourage people to attend vocational training.',
            keywords: ['entering university', 'partly agree', 'vocational training'],
            grammarRules: [
              {
                check: (s) => /\bpartly\s+agree\b/i.test(s),
                rule: 'Cấu trúc nêu quan điểm cân bằng 50/50: "I partly agree with this opinion because...".'
              }
            ],
            commonErrors: [],
            sample: 'It is true that entering university for an academic field plays an important role for many young people. From my point of view, I partly agree with this opinion because we should also encourage more people to attend vocational training.'
          },
          {
            section: 'Đoạn 2: Thân bài 1 (Học Đại học)',
            vn: 'Một mặt, có nhiều lý do tại sao hầu hết học sinh chọn học đại học. Trước hết, họ có thể mở rộng kiến thức chuyên sâu trong các lĩnh vực như luật, tài chính hay ngân hàng.',
            structure: 'On the one hand, there are some reasons why most students choose universities. Firstly, they can broaden their knowledge in terms of law, finance, and banking.',
            keywords: ['On the one hand', 'Firstly', 'broaden their knowledge'],
            grammarRules: [
              {
                check: (s) => /\bbroaden\s+(their\s+)?knowledge\b/i.test(s),
                rule: 'Cụm từ học thuật B2: "broaden their knowledge" (mở rộng kiến thức).'
              }
            ],
            commonErrors: [],
            sample: 'On the one hand, there are some reasons why most students choose universities to study. Firstly, they can broaden their knowledge in terms of law, finance, and banking.'
          },
          {
            section: 'Đoạn 2: Thân bài 1 (Ý thứ 2)',
            vn: 'Thứ hai, sinh viên tốt nghiệp đại học sẽ có nhiều cơ hội lựa chọn nghề nghiệp tốt hơn và cảm thấy tự tin hơn khi bước ra xã hội.',
            structure: 'Secondly, university graduates will have better career choices and feel more confident in society.',
            keywords: ['Secondly', 'career choices', 'confident'],
            grammarRules: [
              {
                check: (s) => /\bsecondly\b/i.test(s),
                rule: 'Từ nối chuyển sang luận điểm thứ hai: "Secondly,".'
              }
            ],
            commonErrors: [],
            sample: 'Secondly, university graduates will have higher career choices to get a good job and feel more confident in society.'
          },
          {
            section: 'Đoạn 3: Thân bài 2 (Học Trường nghề)',
            vn: 'Mặt khác, mọi người rất nên được khuyến khích tham gia các lớp đào tạo nghề. Lý do đầu tiên là họ có thể bắt đầu sự nghiệp sớm hơn vì trường nghề thường chỉ mất từ 1 đến 2 năm để lấy chứng chỉ hành nghề.',
            structure: 'On the other hand, people should be encouraged to attend vocational training classes. One reason is that they can start their careers sooner because vocational schools only take one to two years.',
            keywords: ['On the other hand', 'should be encouraged', 'vocational', 'one to two years'],
            grammarRules: [
              {
                check: (s) => /\bshould\s+be\s+(encouraged|promoted)\b/i.test(s),
                rule: 'Cấu trúc bị động với động từ khuyết thiếu: "people should be encouraged to + V0".'
              }
            ],
            commonErrors: [],
            sample: 'On the other hand, people should be encouraged to attend vocational training classes. One reason is that they can start their professional careers sooner because vocational schools usually take only one to two years.'
          },
          {
            section: 'Đoạn 3: Thân bài 2 (Ý thứ 2)',
            vn: 'Thêm vào đó, ở nhiều quốc gia đang có sự mất cân bằng khi cử nhân đại học thất nghiệp nhiều nhưng lại thiếu hụt lao động lành nghề như thợ điện hay thợ sửa ống nước.',
            structure: 'Also / Furthermore, in many countries, there is graduate unemployment while there is a shortage of skilled labor such as electricians or plumbers.',
            keywords: ['Furthermore', 'Also', 'unemployment', 'shortage of skilled'],
            grammarRules: [
              {
                check: (s) => /\bshortage\s+of\b/i.test(s),
                rule: 'Cụm từ chỉ sự thiếu hụt: "a shortage of skilled labor / tradespeople".'
              }
            ],
            commonErrors: [],
            sample: 'Furthermore, in many countries, there is graduate unemployment while at the same time there is a shortage of skilled workers such as electricians or plumbers.'
          },
          {
            section: 'Đoạn 4: Kết bài',
            vn: 'Tóm lại, học đại học chắc chắn là một con đường dẫn đến thành công; tuy nhiên, giáo dục nghề nghiệp cũng cần được khuyến khích phát triển.',
            structure: 'To sum up, studying at a university is one of the paths to success; nevertheless, vocational education should also be encouraged to develop.',
            keywords: ['To sum up', 'In conclusion', 'university', 'vocational education'],
            grammarRules: [
              {
                check: (s) => /\b(to\s+sum\s+up|in\s+conclusion)\b/i.test(s),
                rule: 'Từ nối kết bài: "To sum up," hoặc "In conclusion,".'
              }
            ],
            commonErrors: [],
            sample: 'To sum up, studying at a university is certainly one of the paths to success; nevertheless, vocational education should also be encouraged to develop.'
          }
        ]
      },
      {
        id: 'vstep_b2_essay_airpollution',
        type: 'Task 2 • Viết luận (Effects & Solutions)',
        title: '4. Ô nhiễm không khí (Air Pollution)',
        prompt: 'Air pollution is one of the largest problems facing the world today. What are its problems (negative effects) and what measures (solutions) can be proposed to solve this problem? Write at least 250 words.',
        formulaNote: 'Mở bài (Giới thiệu Air pollution + Thesis) → Thân bài 1 (Tác hại: Sức khỏe & Nóng lên toàn cầu) → Thân bài 2 (Giải pháp: Luật pháp & Giao thông công cộng) → Kết bài.',
        sentences: [
          {
            section: 'Đoạn 1: Mở bài',
            vn: 'Thế giới hiện đại đã thay đổi rất nhiều; tuy nhiên, ô nhiễm không khí đã dẫn đến vô số hệ lụy tiêu cực trong xã hội. Bài tiểu luận này sẽ thảo luận các tác hại chính của ô nhiễm không khí và đề xuất một số giải pháp để cải thiện tình hình.',
            structure: 'The world has changed a lot; nonetheless, air pollution has led to plenty of problems in society. This essay will discuss the main negative effects of air pollution and suggest several solutions to improve the situation.',
            keywords: ['air pollution', 'This essay will discuss', 'effects', 'solutions'],
            grammarRules: [
              {
                check: (s) => /\bthis\s+essay\s+will\s+discuss\b/i.test(s),
                rule: 'Câu định hướng bài viết: "This essay will discuss the main effects of... and suggest several solutions."'
              }
            ],
            commonErrors: [],
            sample: 'The world has changed a lot; nonetheless, air pollution has led to plenty of problems in society. This essay will discuss the main negative effects related to air pollution and suggest several solutions to improve the situation.'
          },
          {
            section: 'Đoạn 2: Thân bài 1 (Tác hại 1)',
            vn: 'Trước hết, ô nhiễm không khí gây ra rất nhiều vấn đề nghiêm trọng về sức khỏe. Trên thực tế, ngày càng nhiều nhà máy mọc lên và thải ra các khí độc như khí mê-tan và CO2, làm ô nhiễm bầu không khí và dẫn đến bệnh ung thư phổi.',
            structure: 'Firstly, air pollution has caused numerous health problems. In reality, more factories release toxic gases such as methane and carbon dioxide, which pollute the air and lead to lung cancer.',
            keywords: ['Firstly', 'health problems', 'factories', 'toxic gases', 'lung cancer'],
            grammarRules: [
              {
                check: (s) => /\bwhich\s+pollute\b/i.test(s),
                rule: 'Mệnh đề quan hệ bổ nghĩa cho toxic gases: ", which pollute the air and lead to...".'
              }
            ],
            commonErrors: [],
            sample: 'Firstly, air pollution has caused numerous health problems. In reality, more and more factories release toxic gases such as methane and carbon dioxide, which pollute the air and lead to lung cancer.'
          },
          {
            section: 'Đoạn 2: Thân bài 1 (Tác hại 2)',
            vn: 'Thứ hai, ô nhiễm không khí làm gia tăng hiện tượng nóng lên toàn cầu do lượng khói bụi khổng lồ từ các phương tiện giao thông. Ví dụ, tại Thành phố Hồ Chí Minh, tỷ lệ người mắc bệnh hô hấp rất cao do thường xuyên tiếp xúc với khói độc.',
            structure: 'Secondly, air pollution increases global warming because of the huge amount of smoke from vehicles. For example, Ho Chi Minh City has a high rate of people who get respiratory diseases due to regular exposure to toxic smoke.',
            keywords: ['Secondly', 'global warming', 'vehicles', 'For example', 'exposure to'],
            grammarRules: [
              {
                check: (s) => /\bexposure\s+to\b/i.test(s) || /\bbecause\s+of\b/i.test(s),
                rule: 'Cụm danh từ chỉ sự tiếp xúc: "regular exposure to toxic smoke".'
              }
            ],
            commonErrors: [],
            sample: 'Secondly, air pollution might increase global warming because of the huge amount of smoke from vehicles. For example, Ho Chi Minh City has a high rate of people who get lung diseases because of regular exposure to toxic smoke.'
          },
          {
            section: 'Đoạn 3: Thân bài 2 (Giải pháp 1)',
            vn: 'Tuy nhiên, có một số giải pháp khả thi cho vấn đề này. Đầu tiên, chính quyền nên ban hành luật nghiêm ngặt hơn và phạt nặng các nhà máy không xử lý chất độc đúng quy định trước khi xả ra không khí.',
            structure: 'However, there are several possible solutions to the main problems. First, the government ought to release stricter laws to ensure that all factories treat toxins properly before releasing them into the air.',
            keywords: ['However', 'solutions', 'stricter laws', 'factories', 'toxins'],
            grammarRules: [
              {
                check: (s) => /\b(ought\s+to|should|must)\s+release\s+stricter\s+laws\b/i.test(s) || /\bstricter\s+laws\b/i.test(s),
                rule: 'Cụm từ giải pháp của chính phủ: "release stricter laws" (ban hành luật nghiêm ngặt hơn).'
              }
            ],
            commonErrors: [],
            sample: 'However, there are several possible solutions to the main problems. First, the government ought to release stricter laws to assure that all factories have to treat toxins properly before releasing them into the air.'
          },
          {
            section: 'Đoạn 3: Thân bài 2 (Giải pháp 2)',
            vn: 'Thứ hai, mỗi cá nhân nên chung tay bằng cách sử dụng phương tiện giao thông công cộng như xe buýt để đi học và đi làm thay vì sử dụng ô tô hay xe máy cá nhân.',
            structure: 'Second, each person should share their duty by using public transport such as buses to go to work or school rather than using private cars or motorbikes.',
            keywords: ['Second', 'public transport', 'buses', 'rather than', 'private'],
            grammarRules: [
              {
                check: (s) => /\brather\s+than\b|\binstead\s+of\b/i.test(s),
                rule: 'Cấu trúc thay vì: "rather than / instead of + V-ing".'
              }
            ],
            commonErrors: [],
            sample: 'Second, each person should share their duty by using public means of transport such as buses to work or school rather than using private cars or motorbikes.'
          },
          {
            section: 'Đoạn 4: Kết bài',
            vn: 'Tóm lại, ô nhiễm không khí đã gây ra nhiều vấn đề tiêu cực trong xã hội hiện đại và con người cần giải quyết càng sớm càng tốt. Nếu các giải pháp trên được áp dụng, tình hình sẽ trở nên tốt hơn.',
            structure: 'In conclusion, air pollution has led to plenty of negative issues in modern society and we should solve it as soon as possible. If the solutions above are applied, the situation will be better.',
            keywords: ['In conclusion', 'negative issues', 'If the solutions above are applied'],
            grammarRules: [
              {
                check: (s) => /\bif\s+the\s+solutions\s+above\s+are\s+applied\b/i.test(s),
                rule: 'Câu chốt bài: "If the solutions above are applied, the situation will be better."'
              }
            ],
            commonErrors: [],
            sample: 'In conclusion, air pollution has led to plenty of negative issues in our modern society and human beings had better solve it as soon as possible. If the solutions above are applied, the situation will be better.'
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

  // Phân tích chi tiết câu viết của người học (Ngữ pháp, Từ vựng, Độ khớp %) mà KHÔNG tự động lộ câu đáp án
  function analyzeUserSentence(userText, sentObj) {
    const clean = String(userText || '').trim();
    const words = clean.split(/\s+/).filter(Boolean);
    const wc = words.length;

    if (wc < 3) {
      return {
        pct: 15,
        passed: false,
        grammarNotes: ['Câu quá ngắn, chưa đủ cấu trúc Chủ ngữ + Động từ (S + V).'],
        vocabNotes: ['Hãy bổ sung các từ vựng chính diễn đạt ý tiếng Việt bên trái.'],
        suggestedStructure: sentObj.structure
      };
    }

    const grammarIssues = [];
    const grammarGood = [];

    // 1. Kiểm tra các lỗi ngữ pháp thường gặp của câu này
    (sentObj.commonErrors || []).forEach((err) => {
      if (err.pattern.test(clean)) {
        grammarIssues.push(err.fix);
      }
    });

    // 2. Kiểm tra quy tắc ngữ pháp mục tiêu của câu
    const rules = sentObj.grammarRules || [];
    let passedRules = 0;
    rules.forEach((r) => {
      if (r.check(clean)) {
        passedRules++;
        grammarGood.push(r.rule);
      } else {
        grammarIssues.push('Cần chú ý: ' + r.rule);
      }
    });

    // 3. Kiểm tra viết hoa đầu câu & dấu chấm cuối câu
    if (!/^[A-Z]/.test(clean)) {
      grammarIssues.push('Chữ cái đầu câu cần viết hoa.');
    }
    if (!/[.!?]$/.test(clean)) {
      grammarIssues.push('Cuối câu cần có dấu chấm kết thúc (.).');
    }

    // 4. Kiểm tra từ khóa & cấu trúc
    const lower = clean.toLowerCase();
    const kws = sentObj.keywords || [];
    const matchedKw = [];
    const missingKw = [];
    kws.forEach((kw) => {
      if (lower.includes(kw.toLowerCase())) {
        matchedKw.push(kw);
      } else {
        missingKw.push(kw);
      }
    });

    // 5. Tính % độ phù hợp
    const tokenCmp = global.LexiAcademy.compareTokens(sentObj.sample, clean);
    const ruleRatio = rules.length ? passedRules / rules.length : 1;
    const kwRatio = kws.length ? matchedKw.length / kws.length : 1;
    const penalty = grammarIssues.length * 12;

    let rawPct = Math.round(tokenCmp.pct * 0.45 + ruleRatio * 35 + kwRatio * 20) - penalty;
    if (wc >= 7 && grammarIssues.length === 0 && matchedKw.length >= 1) {
      rawPct = Math.max(rawPct, 85);
    }
    const pct = Math.max(20, Math.min(100, rawPct));
    const passed = pct >= 80 && grammarIssues.length === 0;

    return {
      pct,
      passed,
      grammarIssues,
      grammarGood,
      matchedKw,
      missingKw,
      suggestedStructure: sentObj.structure
    };
  }

  function render(lv, state) {
    const list = WRITING_DATA[lv] || WRITING_DATA.B1;
    if (curTopicIdx >= list.length) curTopicIdx = 0;
    const item = list[curTopicIdx];
    const tState = getTopicState(state, item.id, item.sentences.length);
    curSentIdx = tState.activeIdx;
    const curSent = item.sentences[curSentIdx];
    const curSaved = tState.sentences[curSentIdx] || { text: '', passed: false, pct: 0, feedback: '', showHint: false };
    const esc = global.LexiAcademy.esc;

    let passedCount = 0;
    item.sentences.forEach((_, idx) => {
      if (tState.sentences[idx] && tState.sentences[idx].passed) passedCount++;
    });

    const assembledEssay = item.sentences
      .map((_, idx) => (tState.sentences[idx] && tState.sentences[idx].text ? tState.sentences[idx].text.trim() : ''))
      .filter(Boolean)
      .join(' ');
    const totalWords = assembledEssay ? assembledEssay.split(/\s+/).length : 0;

    return `
      <div class="space-y-4">
        <!-- KHUNG TRÊN: CHỌN ĐỀ BÀI & ĐỀ BÀI (TỐI GIẢN) -->
        <div class="card p-4 space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span class="text-xs font-mono text-pri">${esc(item.type)}</span>
              <h3 class="text-base font-bold">${esc(item.title)}</h3>
            </div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 rounded-lg text-xs font-mono bg-pri/15 text-pri font-bold">
                Hoàn thành: ${passedCount}/${item.sentences.length} câu
              </span>
              <button type="button" id="wrt-reset-topic" class="btn !text-xs text-mute">Làm lại</button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            ${list.map((it, idx) => {
              const st = getTopicState(state, it.id, it.sentences.length);
              const doneCnt = it.sentences.filter((_, si) => st.sentences[si] && st.sentences[si].passed).length;
              const isCurrent = idx === curTopicIdx;
              return `
                <button type="button" data-wrt-topic="${idx}" class="text-left p-2.5 rounded-xl border transition ${
                  isCurrent ? 'border-pri bg-pri/15 font-bold' : 'border-line/60 hover:bg-line/20'
                } text-xs flex items-center justify-between gap-2">
                  <span class="truncate">${esc(it.title)}</span>
                  <span class="font-mono text-[10px] shrink-0 ${doneCnt === it.sentences.length ? 'text-ok font-bold' : 'text-mute'}">${doneCnt}/${it.sentences.length}</span>
                </button>
              `;
            }).join('')}
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
              <span class="text-xs font-mono text-warn font-bold">Câu ${curSentIdx + 1}/${item.sentences.length}</span>
            </div>

            <div class="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              ${item.sentences.map((s, idx) => {
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
                        ${isActive ? '👉 Câu ' + (idx + 1) + ' (Đang viết)' : isPassed ? '✓ Câu ' + (idx + 1) + ' (Đã đạt)' : 'Câu ' + (idx + 1)}
                      </span>
                      ${sData.pct ? `<span class="text-[10px] font-mono px-1.5 py-0.5 rounded ${sData.pct >= 80 ? 'bg-ok/20 text-ok' : 'bg-warn/20 text-warn'} font-bold">${sData.pct}%</span>` : ''}
                    </div>
                    <p class="text-xs sm:text-sm leading-relaxed ${isActive ? 'font-semibold text-fg' : 'text-fg/90'}">
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
              }).join('')}
            </div>
          </div>

          <!-- CỘT PHẢI (7/12): TƯƠNG TÁC VIẾT CÂU TIẾNG ANH & PHẢN HỒI AI -->
          <div class="lg:col-span-7 space-y-4">
            <div class="card p-4 sm:p-5 space-y-3.5">
              <!-- Thanh điều hướng câu + Nút Ẩn/Hiện Gợi ý -->
              <div class="flex flex-wrap items-center justify-between gap-2 border-b border-line/60 pb-2.5">
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-1 rounded-lg bg-warn text-slate-950 font-bold text-xs font-mono">
                    Câu ${curSentIdx + 1} / ${item.sentences.length}
                  </span>
                  <button type="button" id="wrt-toggle-hint" class="btn !py-1 !px-2.5 !text-xs ${curSaved.showHint ? 'border-pri text-pri bg-pri/10' : ''}">
                    ${curSaved.showHint ? '🙈 Ẩn gợi ý & cấu trúc' : '💡 Xem gợi ý & cấu trúc'}
                  </button>
                </div>

                <div class="flex items-center gap-1.5">
                  <button type="button" id="wrt-prev-sent" class="btn !py-1 !px-2.5 !text-xs" ${curSentIdx === 0 ? 'disabled' : ''}>← Trước</button>
                  <button type="button" id="wrt-next-sent" class="btn !py-1 !px-2.5 !text-xs" ${curSentIdx === item.sentences.length - 1 ? 'disabled' : ''}>Tiếp →</button>
                </div>
              </div>

              <!-- Khung Gợi ý & Cấu trúc (MẶC ĐỊNH ẨN - chỉ hiện khi người học chủ động bấm mở hoặc sau khi chấm chưa đạt) -->
              <div id="wrt-hint-box" class="${curSaved.showHint ? '' : 'hidden'} inset p-3 rounded-xl space-y-2 text-xs border border-pri/30">
                <div>
                  <span class="font-bold text-pri">Cấu trúc:</span>
                  <span class="font-mono text-fg ml-1">${esc(curSent.structure)}</span>
                </div>
                <div class="flex flex-wrap items-center gap-1.5 pt-1">
                  <span class="font-bold text-mute">Từ gợi ý (bấm để chèn):</span>
                  ${(curSent.keywords || []).map((kw) => `
                    <button type="button" data-wrt-kw="${esc(kw)}" class="px-2 py-0.5 rounded border border-pri/40 bg-pri/10 text-pri font-mono text-xs hover:bg-pri/20">
                      + ${esc(kw)}
                    </button>
                  `).join('')}
                </div>
              </div>

              <!-- Ô nhập câu tiếng Anh (Không lặp lại câu tiếng Việt, không lộ đáp án ở placeholder) -->
              <div class="space-y-2">
                <label for="wrt-sent-input" class="block text-xs font-bold text-mute">
                  Viết câu tiếng Anh tương ứng với Câu ${curSentIdx + 1} bên trái:
                </label>
                <textarea
                  id="wrt-sent-input"
                  rows="3"
                  class="inp text-sm sm:text-base font-medium leading-relaxed"
                  placeholder="Tự viết câu tiếng Anh của bạn tại đây..."
                >${esc(curSaved.text || '')}</textarea>

                <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <button type="button" id="wrt-eval-sent-btn" class="btn btn-pri font-bold !py-2 !px-4">
                    Đánh giá & Sửa lỗi câu ${curSentIdx + 1}
                  </button>

                  <button
                    type="button"
                    id="wrt-pass-next-btn"
                    class="btn ${curSaved.passed ? 'btn-ok font-bold' : ''} !py-2 !px-3.5"
                  >
                    ${curSentIdx < item.sentences.length - 1 ? 'Qua câu tiếp theo (' + (curSentIdx + 2) + ') →' : 'Hoàn thành bài viết ✓'}
                  </button>
                </div>
              </div>

              <!-- KHU VỰC ĐÁNH GIÁ CỦA AI (Nhận xét % phù hợp, lỗi ngữ pháp, cách dùng từ; câu tham khảo được ẩn trong nút riêng) -->
              <div id="wrt-sent-feedback" class="${curSaved.feedback ? '' : 'hidden'} inset p-3.5 rounded-xl space-y-2.5 border border-line text-xs sm:text-sm">
                ${curSaved.feedback || ''}
              </div>
            </div>

            <!-- BẢN GHÉP CÁC CÂU ĐÃ VIẾT -->
            <div class="card p-4 space-y-2.5">
              <div class="flex items-center justify-between border-b border-line/60 pb-2">
                <b class="text-xs sm:text-sm">Bài viết của bạn (ghép từ các câu đã viết)</b>
                <div class="flex items-center gap-2">
                  <span class="font-mono text-xs text-pri font-bold">${totalWords} từ</span>
                  <button type="button" id="wrt-copy-full" class="btn !py-1 !px-2 !text-xs">Sao chép</button>
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
        toggleHintBtn.textContent = nextShow ? '🙈 Ẩn gợi ý & cấu trúc' : '💡 Xem gợi ý & cấu trúc';
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
          tState.sentences[curSentIdx] = { text: '', passed: false, pct: 0, feedback: '', showHint: false };
        }
        tState.sentences[curSentIdx].text = sentInput.value;
        global.LexiAcademy.saveState();
      });
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
        if (!tState.sentences[curSentIdx]) tState.sentences[curSentIdx] = {};
        tState.sentences[curSentIdx].text = txt;
        tState.sentences[curSentIdx].passed = true;
        if (!tState.sentences[curSentIdx].pct) tState.sentences[curSentIdx].pct = 85;

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

    // Đánh giá & Sửa lỗi chi tiết từng câu (KHÔNG tự động lộ đáp án mẫu)
    const evalBtn = container.querySelector('#wrt-eval-sent-btn');
    if (evalBtn && sentInput && fbBox) {
      evalBtn.onclick = async () => {
        const userTxt = sentInput.value.trim();
        if (userTxt.length < 3) {
          global.LexiAcademy.notify('Hãy nhập câu tiếng Anh của bạn để đánh giá.');
          sentInput.focus();
          return;
        }

        const res = analyzeUserSentence(userTxt, curSent);
        if (!tState.sentences[curSentIdx]) tState.sentences[curSentIdx] = {};
        tState.sentences[curSentIdx].text = userTxt;
        tState.sentences[curSentIdx].pct = res.pct;
        tState.sentences[curSentIdx].passed = res.passed;

        const issuesHtml = res.grammarIssues.length
          ? `<ul class="list-disc pl-4 space-y-1 text-warn">${res.grammarIssues.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`
          : `<div class="text-ok">✓ Ngữ pháp và cấu trúc câu đã chính xác, tự nhiên!</div>`;

        const kwAdviceHtml = res.missingKw.length
          ? `<div class="text-mute">Từ/cụm từ nên kết hợp thêm (nếu phù hợp): <b class="text-pri font-mono">${esc(res.missingKw.join(', '))}</b></div>`
          : `<div class="text-ok">✓ Đã sử dụng đầy đủ các cụm từ trọng tâm của câu.</div>`;

        const buildFeedbackHTML = (aiDetailHtml) => `
          <div class="space-y-2.5">
            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-line/60 pb-2">
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold ${
                  res.pct >= 80 ? 'bg-ok/20 text-ok' : 'bg-warn/20 text-warn'
                }">
                  Độ phù hợp: ${res.pct}%
                </span>
                <span class="text-xs font-bold ${res.passed ? 'text-ok' : 'text-warn'}">
                  ${res.passed ? '✓ Đạt yêu cầu — Có thể qua câu tiếp theo' : 'Cần chỉnh sửa lại theo góp ý bên dưới'}
                </span>
              </div>
              ${
                !res.passed
                  ? `<button type="button" id="wrt-open-hint-from-fb" class="text-xs text-pri underline">Mở xem gợi ý cấu trúc</button>`
                  : ''
              }
            </div>

            <div class="space-y-1.5 text-xs leading-relaxed">
              <div><b class="text-fg">1. Nhận xét ngữ pháp & cách dùng từ:</b></div>
              ${issuesHtml}
              ${kwAdviceHtml}
              <div><b class="text-fg">2. Cấu trúc nên dùng ở câu này:</b> <span class="font-mono text-pri">${esc(res.suggestedStructure)}</span></div>
            </div>

            <div id="wrt-ai-detail-slot" class="text-xs leading-relaxed pt-2 border-t border-line/50">
              ${aiDetailHtml}
            </div>

            <!-- Câu mẫu tham khảo luôn được ẩn trong thẻ <details>, chỉ khi người học bấm mới mở -->
            <details class="pt-1 border-t border-line/40 text-xs">
              <summary class="cursor-pointer text-mute hover:text-fg select-none">Xem câu tham khảo (chỉ mở khi bạn thực sự cần)</summary>
              <div class="mt-1.5 p-2 rounded-lg bg-inset font-mono text-ok">${esc(curSent.sample)}</div>
            </details>
          </div>
        `;

        fbBox.classList.remove('hidden');
        fbBox.innerHTML = buildFeedbackHTML('<span class="text-mute italic">Đang phân tích sâu hơn câu viết của bạn...</span>');
        tState.sentences[curSentIdx].feedback = fbBox.innerHTML;
        global.LexiAcademy.saveState();

        const bindFbEvents = () => {
          const openHintBtn = fbBox.querySelector('#wrt-open-hint-from-fb');
          if (openHintBtn && toggleHintBtn && hintBox && hintBox.classList.contains('hidden')) {
            openHintBtn.onclick = () => toggleHintBtn.click();
          }
        };
        bindFbEvents();

        // Gọi AI phân tích trực tiếp câu của người học (Yêu cầu AI nhận xét lỗi & hướng dẫn sửa, KHÔNG chép thẳng câu mẫu)
        if (typeof global.rawAi === 'function') {
          try {
            const prompt = `Đóng vai giáo viên chấm câu tiếng Anh. Học viên đang chuyển câu tiếng Việt sau sang tiếng Anh:
- Câu tiếng Việt: "${curSent.vn}"
- Câu học viên viết: "${userTxt}"

Hãy đánh giá ngắn gọn, đi thẳng vào trọng tâm (tối đa 3 dòng, không rườm rà):
- Đánh giá mức độ phù hợp (%): chỉ rõ phần nào học viên đã viết đúng, chỗ nào sai ngữ pháp/từ vựng (ví dụ sai thì, thừa/thiếu giới từ, sai cấu trúc mệnh đề).
- Hướng dẫn cách sửa cụ thể cho chỗ sai đó để học viên tự sửa lại cho hoàn hảo.`;

            const aiRes = await global.rawAi(prompt);
            if (aiRes) {
              const cleanAi = esc(aiRes)
                .replace(/\*\*(.+?)\*\*/g, '<b class="text-pri">$1</b>')
                .replace(/\n/g, '<br>');
              fbBox.innerHTML = buildFeedbackHTML(`<div class="space-y-1"><b class="text-pri">Phân tích chi tiết câu của bạn:</b><div>${cleanAi}</div></div>`);
              tState.sentences[curSentIdx].feedback = fbBox.innerHTML;
              global.LexiAcademy.saveState();
              bindFbEvents();
            }
          } catch (e) {
            const slot = fbBox.querySelector('#wrt-ai-detail-slot');
            if (slot) {
              slot.innerHTML = `<span class="text-mute">Hãy sửa các điểm ở mục 1 rồi bấm "Đánh giá & Sửa lỗi" lại để đạt 90–100%.</span>`;
              tState.sentences[curSentIdx].feedback = fbBox.innerHTML;
              global.LexiAcademy.saveState();
            }
          }
        }
      };
    }

    // Sao chép bài viết
    const copyFullBtn = container.querySelector('#wrt-copy-full');
    if (copyFullBtn) {
      copyFullBtn.onclick = () => {
        const fullTxt = item.sentences
          .map((_, idx) => (tState.sentences[idx] && tState.sentences[idx].text ? tState.sentences[idx].text.trim() : ''))
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
