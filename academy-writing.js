/**
 * LexiContext Academy — Module Luyện Viết VSTEP (academy-writing.js)
 * Tính năng đặc biệt:
 * - Bám sát 100% tài liệu ôn thi VSTEP (Task 1: 5 mẫu Thư/Email B1; Task 2: 4 đề tủ Essay B2)
 * - Giao diện chia đôi màn hình (Split-Screen Interactive Sentence-by-Sentence):
 *   + Cột trái: Đoạn văn Dàn ý Tiếng Việt với hiệu ứng "Chạy câu" (Highlight câu đang xử lý, tick xanh câu đã đạt)
 *   + Cột phải: Không gian tương tác viết Tiếng Anh cho từng câu, gợi ý cấu trúc/từ vựng VSTEP, AI chấm sửa trực tiếp từng câu
 *   + Khi câu đạt tiêu chuẩn -> Mở khóa chuyển sang câu tiếp theo -> Ghép thành bài hoàn chỉnh cuối cùng.
 */
(function (global) {
  'use strict';

  const WRITING_DATA = {
    B1: [
      {
        id: 'vstep_b1_email_info',
        type: 'VSTEP Task 1 • Email Cung cấp thông tin (Informal Letter)',
        title: '1. Thư trả lời bạn nước ngoài (Jane hỏi về người bạn An)',
        prompt: 'You received an email from your English friend, Jane. She asked you for some information about one of your friends, An, who wants to stay with Jane’s family in London this summer (personality, hobbies/interests, current work/study). Write an email (at least 120 words) responding to Jane.',
        formulaNote: 'Bố cục 5 phần chuẩn VSTEP: Chào hỏi → Hỏi thăm + Nêu mục đích (I am writing this email to...) → Trả lời lần lượt 3 câu hỏi (First of all / Secondly / Finally) → Kết thư & Ký tên.',
        sentences: [
          {
            section: 'Phần 1: Mở đầu & Nêu mục đích viết thư',
            vn: 'Chào Jane, dạo này bạn thế nào? Mình vẫn khỏe và hy vọng bạn cùng gia đình cũng đều khỏe mạnh.',
            hint: 'Dùng mẫu hỏi thăm thân mật: "Dear Jane, How is it going? I am doing well and I hope you and your family are doing well too."',
            keywords: ['Dear Jane', 'How is it going', 'hope you'],
            grammarTip: 'Thư thân mật (Informal) dùng lời chào "Dear + Tên," và câu hỏi thăm sức khỏe mở đầu để ăn điểm Task Fulfillment.',
            sample: 'Dear Jane, How is it going? I am doing well and I hope you and your family are doing well too.'
          },
          {
            section: 'Phần 1: Mở đầu & Nêu mục đích viết thư',
            vn: 'Mình viết bức thư điện tử này để trả lời các câu hỏi của bạn về cô bạn thân của mình là An, người sẽ sang London vào mùa hè này.',
            hint: 'Dùng mẫu chuẩn: "I am writing this email to answer your questions about my best friend, An, who is going to London this summer."',
            keywords: ['writing this email to', 'answer your questions'],
            grammarTip: 'Cấu trúc mục đích ăn điểm VSTEP: "I am writing this letter/email to + V0 (answer your questions about...)".',
            sample: 'I am writing this email to answer your questions about my close friend, An, who is going to take a course in London this summer.'
          },
          {
            section: 'Phần 2: Nội dung chính (Trả lời 3 ý đề bài)',
            vn: 'Trước hết, về tính cách của An, cô ấy là một người rất hòa đồng, tốt bụng và luôn sẵn lòng giúp đỡ mọi người xung quanh.',
            hint: 'Từ nối mở đầu: "First of all," + "regarding her personality, she is very sociable, kind-hearted, and willing to help others."',
            keywords: ['First of all', 'sociable', 'kind'],
            grammarTip: 'Dùng từ nối "First of all," để trả lời câu hỏi số 1 của đề (Personality). Tính từ ăn điểm: sociable, outgoing, friendly.',
            sample: 'First of all, regarding her personality, she is extremely sociable, kind-hearted, and always willing to help people around her.'
          },
          {
            section: 'Phần 2: Nội dung chính (Trả lời 3 ý đề bài)',
            vn: 'Thứ hai, về sở thích cá nhân, cô ấy rất đam mê đọc sách tiếng Anh, nấu các món ăn truyền thống Việt Nam và chụp ảnh phong cảnh.',
            hint: 'Từ nối thứ hai: "Secondly, / What is more," + "when it comes to her hobbies, she is keen on reading books, cooking traditional Vietnamese food..."',
            keywords: ['Secondly', 'What is more', 'hobbies', 'cooking'],
            grammarTip: 'Dùng "Secondly," hoặc "What is more," để nối sang ý thứ 2. Cấu trúc yêu thích: "be keen on / be fond of / enjoy + V-ing".',
            sample: 'What is more, when it comes to her hobbies and interests, she is keen on reading books, cooking traditional Vietnamese dishes, and taking photos.'
          },
          {
            section: 'Phần 2: Nội dung chính (Trả lời 3 ý đề bài)',
            vn: 'Cuối cùng, hiện tại cô ấy đang là sinh viên năm cuối tại một trường đại học và học tập vô cùng chăm chỉ.',
            hint: 'Từ nối cuối: "Finally, / Last but not least," + "she is currently a final-year university student and studies very hard."',
            keywords: ['Finally', 'Last but not least', 'currently', 'student'],
            grammarTip: 'Dùng "Finally," hoặc "Last but not least," để chốt câu hỏi số 3 (Current work or study).',
            sample: 'Last but not least, she is currently a final-year student at a local university, and she works very hard on her academic major.'
          },
          {
            section: 'Phần 3: Kết thư & Chào tạm biệt',
            vn: 'Mình chắc chắn rằng An sẽ hòa nhập rất tốt với gia đình của bạn. Cảm ơn bạn đã đọc thư và mình rất mong sớm nhận được hồi âm từ bạn. Thân mến, Annie.',
            hint: 'Dùng mẫu chốt thư: "I am sure she will fit in well with your family. Thank you for reading my email. I am looking forward to hearing from you soon. Best regards, Annie."',
            keywords: ['fit in', 'looking forward to hearing from you', 'Best regards'],
            grammarTip: 'Cấu trúc kết thư bất bại: "I am looking forward to hearing from you soon. Best regards / Best wishes, Annie."',
            sample: 'I am sure that she will fit in really well with your family. Thank you for taking your time to read my email. I am looking forward to hearing from you soon. Best regards, Annie.'
          }
        ]
      },
      {
        id: 'vstep_b1_email_advice',
        type: 'VSTEP Task 1 • Email Đưa lời khuyên (Giving Advice)',
        title: '2. Thư khuyên bạn cách cải thiện sức khỏe & giảm căng thẳng',
        prompt: 'Your friend Alex wrote an email saying he feels exhausted and stressed because of studying late and eating fast food. Write an email (at least 120 words) to give him some advice on how to stay healthy and study effectively.',
        formulaNote: 'Công thức khuyên nhủ VSTEP: I am writing to give you some advice... → If I were you, I would + V0 / I would like to suggest that you + V0 / It would be a good idea when you + V0.',
        sentences: [
          {
            section: 'Phần 1: Hỏi thăm & Bày tỏ sự cảm thông',
            vn: 'Chào Alex, mọi việc thế nào rồi? Mình rất tiếc khi nghe về những vấn đề căng thẳng và mệt mỏi của bạn dạo gần đây.',
            hint: 'Gợi ý: "Dear Alex, How is it going? I was sorry to hear about your stress and exhaustion recently."',
            keywords: ['Dear Alex', 'sorry to hear about', 'problems'],
            grammarTip: 'Mẫu câu mở đầu thư khuyên nhủ: "I was sorry to hear about your problems. Here is what I think you should do."',
            sample: 'Dear Alex, How is it going? I hope you are doing well. I was really sorry to hear about your health problems and stress recently.'
          },
          {
            section: 'Phần 1: Nêu mục đích viết thư',
            vn: 'Mình viết bức thư này để đưa cho bạn một vài lời khuyên hữu ích giúp bạn vượt qua giai đoạn khó khăn này.',
            hint: 'Gợi ý: "I am writing this email to give you some useful advice about your problem."',
            keywords: ['writing this email to', 'give you some', 'advice'],
            grammarTip: 'Cấu trúc mục đích: "I am writing this email to give you some useful advice about your problem."',
            sample: 'I am writing this email to give you some useful advice about your problem so that you can feel better soon.'
          },
          {
            section: 'Phần 2: Lời khuyên 1 (Chế độ ăn uống)',
            vn: 'Trước hết, nếu mình là bạn, mình sẽ ngừng ăn đồ ăn nhanh và bắt đầu nấu các bữa ăn lành mạnh có nhiều rau xanh và trái cây.',
            hint: 'Dùng câu điều kiện loại 2 ăn điểm B1/B2: "First of all, if I were you, I would stop eating fast food and start cooking healthy meals with vegetables."',
            keywords: ['First of all', 'if I were you, I would', 'healthy'],
            grammarTip: 'Cấu trúc ăn điểm ngữ pháp cao trong thư Advice: "If I were you, I would + V0".',
            sample: 'First of all, if I were you, I would stop eating fast food and try to prepare nutritious meals with plenty of fresh vegetables and fruit.'
          },
          {
            section: 'Phần 2: Lời khuyên 2 (Giấc ngủ & Thời gian biểu)',
            vn: 'Hơn thế nữa, mình muốn đề xuất rằng bạn nên lập một thời gian biểu học tập hợp lý và đi ngủ trước 11 giờ đêm mỗi ngày.',
            hint: 'Dùng cấu trúc gợi ý trang trọng: "What is more, I would like to suggest that you make a reasonable study schedule and go to bed before 11 p.m."',
            keywords: ['What is more', 'suggest that you', 'schedule'],
            grammarTip: 'Cấu trúc câu phức ăn điểm: "I would like to suggest that you (should) + V0".',
            sample: 'What is more, I would like to suggest that you create a balanced study schedule and go to bed before 11 p.m. every night.'
          },
          {
            section: 'Phần 2: Lời khuyên 3 (Tập thể dục)',
            vn: 'Cuối cùng, sẽ là một ý kiến rất hay khi bạn dành 30 phút mỗi ngày để chạy bộ hoặc nghe nhạc nhẹ nhằm giải tỏa áp lực.',
            hint: 'Dùng mẫu: "Finally, it would be a good idea when you spend 30 minutes a day jogging or listening to music to reduce stress."',
            keywords: ['Finally', 'good idea', 'spend', 'reduce stress'],
            grammarTip: 'Cấu trúc: "It would be a good idea when/if you + V0" + "spend time + V-ing".',
            sample: 'Finally, it would be a good idea if you spend thirty minutes a day jogging in the park or listening to soft music to relax your mind.'
          },
          {
            section: 'Phần 3: Động viên & Kết thư',
            vn: 'Đừng lo lắng quá nhé, mọi chuyện rồi sẽ ổn thôi! Mình hy vọng lời khuyên của mình sẽ giúp ích cho bạn. Viết thư lại cho mình sớm nhé. Thân ái, Annie.',
            hint: 'Dùng mẫu: "Do not worry! Everything will be okay. I hope my advice can help you overcome the problem. Write to me soon. Best wishes, Annie."',
            keywords: ['Everything will be okay', 'overcome', 'Best wishes'],
            grammarTip: 'Khép lại bức thư bằng lời động viên chân thành và chữ ký.',
            sample: 'Do not worry! Everything will be okay. I hope my advice can help you overcome the problem quickly. Write to me soon. Best wishes, Annie.'
          }
        ]
      },
      {
        id: 'vstep_b1_email_complaint',
        type: 'VSTEP Task 1 • Email Phàn nàn dịch vụ/sản phẩm (Formal Complaint)',
        title: '3. Thư phàn nàn về sản phẩm mua online bị lỗi',
        prompt: 'You bought a laptop online from a store last week, but when it arrived, the screen was scratched and the battery did not work properly. Write an email (at least 120 words) to the store manager to complain about the product and ask for a solution.',
        formulaNote: 'Công thức thư Complaint (Trang trọng): Dear Sir or Madam → I am writing to complain about... → Trình bày vấn đề (However...) → Nêu hậu quả (Therefore...) → Yêu cầu giải pháp (replace a new one / full refund) → Yours faithfully.',
        sentences: [
          {
            section: 'Phần 1: Chào trang trọng & Nêu mục đích phàn nàn',
            vn: 'Kính gửi Quý Ông/Bà, tôi viết bức thư điện tử này để phàn nàn về chiếc máy tính xách tay mà tôi đã mua từ cửa hàng trực tuyến của quý công ty vào tuần trước.',
            hint: 'Dùng mẫu: "Dear Sir or Madam, I am writing this email to complain about the laptop that I purchased from your online store last week."',
            keywords: ['Dear Sir or Madam', 'writing this email to complain about'],
            grammarTip: 'Thư trang trọng chưa biết tên người nhận bắt buộc mở đầu bằng "Dear Sir or Madam," và nêu trực tiếp mục đích "to complain about...".',
            sample: 'Dear Sir or Madam, I am writing this email to complain to you about the laptop that I ordered from your online website last Monday.'
          },
          {
            section: 'Phần 2: Trình bày vấn đề xuất hiện',
            vn: 'Tôi vốn là một khách hàng thân thiết của công ty; tuy nhiên, khi nhận được hàng vào hôm qua, tôi vô cùng thất vọng vì màn hình bị trầy xước và pin không hoạt động.',
            hint: 'Dùng mẫu: "I am a big fan of your company; however, when I received the package yesterday, I was disappointed because the screen was scratched and the battery did not work."',
            keywords: ['However', 'disappointed', 'screen', 'battery'],
            grammarTip: 'Trình bày vấn đề với liên từ tương phản "However, S + V".',
            sample: 'I have always been a loyal customer of your company; however, when the package arrived yesterday, I was shocked to see that the screen was badly scratched and the battery could not charge.'
          },
          {
            section: 'Phần 2: Nêu ảnh hưởng / Hậu quả',
            vn: 'Do đó, sự cố này đã làm gián đoạn nghiêm trọng công việc hàng ngày cũng như việc học trực tuyến của tôi.',
            hint: 'Dùng từ nối kết quả: "Therefore, this problem has seriously disrupted my daily work and online study."',
            keywords: ['Therefore', 'As a result', 'work', 'study'],
            grammarTip: 'Nêu ảnh hưởng/hậu quả bằng "Therefore, S + V" hoặc "As a result, S + V".',
            sample: 'Therefore, this defective product has caused me great inconvenience and delayed my urgent work projects.'
          },
          {
            section: 'Phần 3: Đưa ra yêu cầu giải quyết',
            vn: 'Vì sản phẩm này vẫn còn trong thời hạn bảo hành, tôi muốn yêu cầu quý cửa hàng đổi cho tôi một chiếc máy mới hoặc hoàn lại toàn bộ số tiền.',
            hint: 'Dùng mẫu: "Because this product is still under warranty, I would like to request that you replace it with a new one or give me a full refund."',
            keywords: ['under warranty', 'replace', 'full refund'],
            grammarTip: 'Cấu trúc ăn điểm thư phàn nàn: "replace a new one because it is under warranty" hoặc "give me a full refund".',
            sample: 'Since this item is still under warranty, I would like to request that your company replace it with a brand-new laptop or give me a full refund immediately.'
          },
          {
            section: 'Phần 4: Kết thư trang trọng',
            vn: 'Tôi hy vọng quý vị sẽ xem xét và giải quyết vấn đề này sớm nhất có thể. Tôi rất mong sớm nhận được phản hồi từ quý vị. Trân trọng, Annie.',
            hint: 'Dùng mẫu: "I hope that you will have a look and solve this issue as soon as possible. I am looking forward to hearing from you soon. Yours faithfully, Annie."',
            keywords: ['as soon as possible', 'looking forward to hearing from you', 'Yours faithfully'],
            grammarTip: 'Mở đầu là "Dear Sir or Madam" thì kết thư chuẩn mực là "Yours faithfully,".',
            sample: 'I hope that you will look into this matter and resolve it as soon as possible. I am looking forward to hearing from you soon. Yours faithfully, Annie.'
          }
        ]
      },
      {
        id: 'vstep_b1_email_application',
        type: 'VSTEP Task 1 • Email Xin việc (Job Application)',
        title: '4. Thư ứng tuyển vị trí việc làm (Application Letter)',
        prompt: 'You saw an advertisement on the internet for a part-time English tutor / tour guide position. Write an email (at least 120 words) to apply for this job, mentioning your education, work experience, skills, and why you want the job.',
        formulaNote: 'Công thức 7 ý thư Xin việc: Nêu vị trí ứng tuyển (apply for the position of...) → Học vấn (Education) → Kinh nghiệm (Work experience) → Kỹ năng & Điểm mạnh (outgoing, sociable, good at...) → Lý do ứng tuyển → Yours sincerely.',
        sentences: [
          {
            section: 'Phần 1: Mở đầu & Nêu vị trí ứng tuyển',
            vn: 'Kính gửi Quý Ông/Bà, tôi viết thư này để ứng tuyển vào vị trí hướng dẫn viên du lịch bán thời gian như được đăng tuyển trên trang web của quý công ty.',
            hint: 'Dùng mẫu: "Dear Sir or Madam, I am writing this email to apply for the position of a part-time tour guide as advertised on your website."',
            keywords: ['apply for the position of', 'advertised'],
            grammarTip: 'Mẫu câu mở đầu chuẩn: "I am writing this email to apply for the position of + N/V-ing (as advertised on the website)".',
            sample: 'Dear Sir or Madam, I am writing this email to apply for the position of a part-time tour guide as advertised on your company website yesterday.'
          },
          {
            section: 'Phần 2: Trình bày Học vấn & Kinh nghiệm',
            vn: 'Trước hết, tôi hiện là sinh viên năm ba tại trường đại học Cần Thơ và tôi đã có hơn hai năm kinh nghiệm làm việc trong lĩnh vực dịch vụ khách hàng.',
            hint: 'Dùng mẫu: "First of all, I am a third-year student at Can Tho University, and I have over two years of experience in customer service."',
            keywords: ['student', 'experience', 'years'],
            grammarTip: 'Gộp thông tin Học vấn (Education) và Kinh nghiệm (Work experience) bằng thì Hiện tại đơn & Hiện tại hoàn thành.',
            sample: 'First of all, I am currently a third-year student at Can Tho University, and I have gained two years of practical experience in hospitality and customer service.'
          },
          {
            section: 'Phần 2: Nêu Điểm mạnh & Kỹ năng cá nhân',
            vn: 'Thêm vào đó, tôi không chỉ năng động, hòa đồng mà còn giao tiếp tiếng Anh rất trôi chảy, vì vậy tôi có thể làm việc hiệu quả với nhiều đối tượng khách hàng khác nhau.',
            hint: 'Dùng cấu trúc: "Besides, I am not only outgoing and sociable, but also good at speaking English fluently. Thus, I can work well with many kinds of people."',
            keywords: ['not only', 'but also', 'outgoing', 'sociable'],
            grammarTip: 'Cấu trúc ăn điểm B1/B2: "I am not only outgoing but also sociable. Thus, I can work with many kinds of people."',
            sample: 'Besides, I am not only outgoing and sociable, but I am also good at communicating in English fluently; thus, I can work effectively with many kinds of people.'
          },
          {
            section: 'Phần 2: Nêu lý do ứng tuyển',
            vn: 'Lý do tôi muốn ứng tuyển vào vị trí này là vì tôi mong muốn trau dồi kỹ năng giao tiếp thực tế và có một khoản thu nhập ổn định để phụ giúp gia đình.',
            hint: 'Dùng cấu trúc: "The reason why I would like to apply for this position is that I want to improve my communication skills and earn a stable income to help my parents."',
            keywords: ['The reason why', 'improve', 'communication skills'],
            grammarTip: 'Cấu trúc nhấn mạnh lý do: "The reason why I would like to apply for this position is that S + V".',
            sample: 'The reason why I would like to apply for this position is that I would be able to improve my communication skills and have a stable job to support my parents.'
          },
          {
            section: 'Phần 3: Kết thư xin việc',
            vn: 'Tôi đã đính kèm hồ sơ xin việc (CV) của mình để quý vị xem xét. Tôi rất mong sớm nhận được phản hồi từ quý công ty. Trân trọng, Annie.',
            hint: 'Dùng mẫu: "I have attached my CV for your consideration. I look forward to hearing from you soon. Yours sincerely, Annie."',
            keywords: ['look forward to hearing from you', 'Yours sincerely'],
            grammarTip: 'Kết thư trang trọng và lịch sự.',
            sample: 'Thank you for your time and consideration. I look forward to hearing from you soon. Yours sincerely, Annie.'
          }
        ]
      }
    ],
    B2: [
      {
        id: 'vstep_b2_essay_internet',
        type: 'VSTEP Task 2 • Dạng 1: Thuận lợi & Bất lợi (Benefits & Drawbacks)',
        title: '1. Thuận lợi và Bất lợi của Internet (Đề tủ số 1)',
        prompt: 'The Internet has brought about many changes into our day-to-day life. Nowadays we are doing things such as mailing, contacting, banking and communication much faster. Do these developments have more advantages than disadvantages? Write an essay of at least 250 words.',
        formulaNote: 'Công thức 4 đoạn (MB - TB1 Merits - TB2 Demerits - KB): Mỗi ý tuân thủ chặt chẽ chuỗi PEEL: Point (The first merit is that...) → Explain (In other words / It means that...) → Result (Thus / As a result...) → Example (For example...).',
        sentences: [
          {
            section: 'Đoạn 1: Mở bài (Introduction - 3 câu)',
            vn: 'Trong kỷ nguyên toàn cầu hóa ngày nay, mạng Internet đang ngày càng trở nên phổ biến và đóng vai trò quan trọng trong đời sống hàng ngày của chúng ta.',
            hint: 'Dùng mẫu mở bài: "In the era of globalization, the Internet tends to become more and more popular in our daily lives."',
            keywords: ['era of globalization', 'Internet', 'popular'],
            grammarTip: 'Câu 1 Mở bài: Giới thiệu chủ đề chung (General Background).',
            sample: 'In the era of globalization, the Internet tends to become more and more popular and plays an essential role in our daily lives.'
          },
          {
            section: 'Đoạn 1: Mở bài (Introduction)',
            vn: 'Tuy nhiên, tôi giữ niềm tin vững chắc rằng xu hướng này mang lại cả những mặt thuận lợi lẫn bất lợi. Bài tiểu luận này sẽ thảo luận cả ưu điểm và nhược điểm của vấn đề này.',
            hint: 'Dùng mẫu: "However, I hold a firm belief that this trend brings both pros and cons. This essay will discuss both merits and demerits of this trend."',
            keywords: ['merits and demerits', 'pros and cons', 'This essay will discuss'],
            grammarTip: 'Câu Thesis Statement bất bại cho dạng Benefits - Drawbacks: "This essay will discuss both merits and demerits of this problem."',
            sample: 'However, I hold a firm belief that this trend brings both pros and cons. This essay will discuss both the merits and demerits of using the Internet.'
          },
          {
            section: 'Đoạn 2: Thân bài 1 — Mặt thuận lợi (Merits)',
            vn: 'Một mặt, việc sử dụng Internet có thể mang lại vô số lợi ích to lớn. Thuận lợi đầu tiên là nó là một phương tiện giải trí tuyệt vời.',
            hint: 'Dùng mẫu: "On the one hand, using the Internet can offer tremendous advantages. Firstly, the first merit of this is that it is a great means of entertainment."',
            keywords: ['On the one hand', 'advantages', 'merit', 'entertainment'],
            grammarTip: 'Câu chủ đề đoạn 1: "On the one hand, ... merits/advantages...". Nêu Point 1: "Firstly, it would be a great means of entertainment."',
            sample: 'On the one hand, using the Internet can offer tremendous advantages. Firstly, it would be a great means of entertainment.'
          },
          {
            section: 'Đoạn 2: Giải thích & Kết quả của Thuận lợi 1',
            vn: 'Nói cách khác, mọi người có xu hướng nghe nhạc, chơi trò chơi trực tuyến hoặc xem các video giải trí; nhờ vậy, họ có thể thư giãn sau giờ học và có thêm năng lượng tích cực để làm việc hiệu quả.',
            hint: 'Dùng cụm giải thích & kết quả: "In other words, people tend to listen to music or watch videos; thus, they can unwind after school and have more positive energy to work effectively."',
            keywords: ['In other words', 'unwind', 'thus', 'effectively'],
            grammarTip: 'Áp dụng công thức mở rộng câu: Giải thích ("In other words, SV") + Kết quả ("Thus, SV"). Từ vựng B2: unwind (thư giãn).',
            sample: 'In other words, people tend to listen to music, play online games, or watch entertaining videos. Thus, they can unwind after work and have more positive energy to study effectively.'
          },
          {
            section: 'Đoạn 2: Thuận lợi 2 + Giải thích + Ví dụ',
            vn: 'Thứ hai, Internet là một nguồn thông tin khổng lồ. Điều này có nghĩa là con người có khả năng tìm kiếm thông tin giá trị cho công việc và học tập. Ví dụ, nếu người dùng muốn cải thiện kỹ năng tiếng Anh, họ có thể xem hàng loạt video trên YouTube hoàn toàn miễn phí.',
            hint: 'Dùng mẫu: "Secondly, the Internet is a great source of information. It means that people are capable of seeking valuable information. For example, if users want to boost their English skills, they can watch videos on YouTube for free."',
            keywords: ['Secondly', 'source of information', 'It means that', 'For example'],
            grammarTip: 'Chuỗi PEEL hoàn chỉnh: Point (Secondly...) → Explain (It means that...) → Example (For example, if SV, SV).',
            sample: 'Secondly, the Internet is likely to be a great source of information. It means that human beings are capable of seeking valuable information for their work and study. For example, if Internet users long to boost their English skills, they can watch a variety of videos on YouTube without paying money.'
          },
          {
            section: 'Đoạn 3: Thân bài 2 — Mặt bất lợi (Demerits)',
            vn: 'Mặt khác, có một số bất lợi rõ ràng của việc sử dụng Internet. Trước hết, nó có thể gây ra nhiều vấn đề đối với sự tương tác xã hội ngoài đời thực.',
            hint: 'Dùng mẫu: "On the other hand, there are several obvious disadvantages of using the Internet. First of all, it may cause several problems with social interaction."',
            keywords: ['On the other hand', 'disadvantages', 'demerits', 'social interaction'],
            grammarTip: 'Chuyển đoạn tương phản bằng "On the other hand, there are several obvious disadvantages/demerits...".',
            sample: 'On the other hand, there are several obvious disadvantages of using the Internet. First of all, the Internet may cause several problems with real-life social interaction.'
          },
          {
            section: 'Đoạn 3: Giải thích & Kết quả Bất lợi 1 + Bất lợi 2',
            vn: 'Nhiều người thích lướt Facebook hơn là gặp gỡ bạn bè; kết quả là điều này làm giảm sự tự tin khi giao tiếp trước đám đông. Thứ hai, lướt mạng rất tốn thời gian vì nhiều học sinh mải chơi game đến mức không còn đủ thời gian học tập.',
            hint: 'Dùng mẫu: "People prefer surfing Facebook instead of meeting friends. As a result, it could decrease their confidence in public. Secondly, using the Internet is time-consuming because students spend too much time playing online games."',
            keywords: ['As a result', 'confidence', 'Secondly', 'time-consuming'],
            grammarTip: 'Sử dụng cụm kết quả "As a result, SV" và tính từ ghép B2 "time-consuming" (tốn thời gian).',
            sample: 'More people tend to prefer surfing Facebook instead of meeting friends. As a result, it could decrease their confidence to speak in public. Secondly, using the Internet seems to be time-consuming since many students spend plenty of time playing online games instead of studying.'
          },
          {
            section: 'Đoạn 4: Kết bài (Conclusion)',
            vn: 'Tóm lại, việc sử dụng Internet có cả lợi ích lẫn tác hại. Mặc dù nó có một vài nhược điểm, tôi tin chắc rằng chúng ta nên học cách tối đa hóa mặt tích cực cũng như giảm thiểu mặt tiêu cực.',
            hint: 'Dùng mẫu: "In conclusion / To sum up, there are both merits and demerits of using the Internet. Although it has some disadvantages, I am convinced that we should maximize the advantages and minimize the disadvantages."',
            keywords: ['To sum up', 'In conclusion', 'maximize', 'minimize'],
            grammarTip: 'Câu chốt bài luận ăn điểm từ vựng C1: "maximize the advantages as well as minimize the disadvantages".',
            sample: 'To sum up, there are both benefits and drawbacks of using the Internet. Although the Internet may have some disadvantages, I am convinced that we should learn how to maximize the advantages as well as minimize the disadvantages.'
          }
        ]
      },
      {
        id: 'vstep_b2_essay_braindrain',
        type: 'VSTEP Task 2 • Dạng 3: Nguyên nhân & Giải pháp (Causes & Solutions)',
        title: '2. Vấn đề Chảy máu chất xám (Brain Drain - Đề tủ số 2)',
        prompt: 'An increasing number of professionals, such as doctors and teachers, are leaving their own poorer countries to work in developed countries. What are the reasons behind this trend? What solutions can you suggest to deal with this situation? Write at least 250 words.',
        formulaNote: 'Công thức Causes - Solutions: Mở bài (Nêu vấn đề Brain drain + Thesis statement) → Thân bài 1 (There are several major reasons why... The first cause is... Another problem is...) → Thân bài 2 (Solutions: Government & Companies) → Kết bài (In conclusion + Câu điều kiện If the solutions above are applied...).',
        sentences: [
          {
            section: 'Đoạn 1: Mở bài (Introduction)',
            vn: 'Thế giới đã thay đổi rất nhiều, tuy nhiên một số vấn đề tiêu cực đã xuất hiện mà một trong số đó là tình trạng chảy máu chất xám. Bài viết này sẽ thảo luận các nguyên nhân chính của hiện tượng chảy máu chất xám và đề xuất một số giải pháp để cải thiện tình hình.',
            hint: 'Dùng mẫu tài liệu: "The world has changed a lot; nonetheless, some negative changes have happened. One of them is that brain drain is a serious problem. This essay will discuss the main causes of brain drain and suggest some solutions to improve the situation."',
            keywords: ['brain drain', 'discuss', 'causes', 'solutions'],
            grammarTip: 'Thuật ngữ chủ đề bắt buộc nhớ: "brain drain" (chảy máu chất xám). Câu Thesis chuẩn: "This essay will discuss the main causes of this problem and suggest several solutions."',
            sample: 'The world has changed a lot; nonetheless, some negative issues have emerged, and one of them is that brain drain has become a serious problem. This essay will discuss the main causes related to brain drain and suggest some practical solutions to improve the situation.'
          },
          {
            section: 'Đoạn 2: Thân bài 1 — Nguyên nhân 1 (Điều kiện làm việc)',
            vn: 'Có một số nguyên nhân chính dẫn đến tình trạng chảy máu chất xám ở các nước đang phát triển. Nguyên nhân đầu tiên là điều kiện làm việc còn thiếu thốn vì nhiều cơ sở thiếu trang thiết bị và máy móc hiện đại.',
            hint: 'Dùng mẫu: "There are several major reasons why brain drain occurs. The first cause is poor working conditions because many companies lack modern machines and equipment."',
            keywords: ['reasons', 'first cause', 'working conditions', 'modern'],
            grammarTip: 'Khung câu chủ đề Causes: "There are several major reasons why this problem happens. The first cause of this problem is that S + V."',
            sample: 'There are several major reasons why brain drain happens in developing countries. The first cause of this problem is poor working conditions because many local workplaces lack modern facilities and advanced equipment.'
          },
          {
            section: 'Đoạn 2: Nguyên nhân 2 (Mức lương thấp) + Ví dụ',
            vn: 'Một nguyên nhân lớn khác là mức thu nhập thấp. Ví dụ, nhiều trí thức trẻ chỉ nhận được mức lương khiêm tốn mỗi tháng; do đó, họ không có đủ tài chính để trang trải chi phí sinh hoạt và lo cho con cái.',
            hint: 'Dùng mẫu: "Another major problem is the low salary. For example, many workers only receive a modest income each month; hence, they do not have enough money to cover living expenses and support their children."',
            keywords: ['Another', 'low salary', 'For example', 'hence'],
            grammarTip: 'Dùng từ nối "Another major cause is..." và liên từ chỉ kết quả "hence, S + V" (do đó).',
            sample: 'Another major problem is the low salary. For example, many qualified professionals only receive a modest monthly income; hence, they struggle to cover daily living expenses and education costs for their children.'
          },
          {
            section: 'Đoạn 3: Thân bài 2 — Giải pháp 1 (Cải thiện môi trường làm việc)',
            vn: 'Tuy nhiên, có một số giải pháp khả thi cho vấn đề này. Trước hết, chính phủ và các doanh nghiệp nên đầu tư nâng cấp điều kiện làm việc với các trang thiết bị hiện đại hơn cho nhân viên.',
            hint: 'Dùng mẫu: "Nevertheless, there are some possible solutions to these problems. First, the government and companies had better improve working conditions with more up-to-date equipment for employees."',
            keywords: ['solutions', 'First', 'government', 'improve', 'working conditions'],
            grammarTip: 'Cấu trúc khuyên/giải pháp B2: "S + had better / ought to + V0" (nên làm gì).',
            sample: 'Nevertheless, there are some possible solutions to tackle these problems. First, it is the responsibility of the government and companies to improve working conditions with more up-to-date facilities for employees.'
          },
          {
            section: 'Đoạn 3: Giải pháp 2 (Tăng lương & Đãi ngộ)',
            vn: 'Thứ hai, các tổ chức cần tăng mức lương và chế độ đãi ngộ xứng đáng cho đội ngũ nhân sự giỏi để họ có thu nhập tốt hơn và yên tâm cống hiến.',
            hint: 'Dùng mẫu: "Secondly, companies ought to increase the salary and benefits of their skilled staff so that their lives can be much better."',
            keywords: ['Secondly', 'ought to', 'increase', 'salary'],
            grammarTip: 'Kết hợp "ought to + V0" với mệnh đề chỉ mục đích "so that + S + V".',
            sample: 'Secondly, organizations ought to increase the salary and financial incentives for talented staff so that they can earn a decent living and stay in their homeland.'
          },
          {
            section: 'Đoạn 4: Kết bài (Conclusion)',
            vn: 'Tóm lại, chảy máu chất xám là một vấn đề nghiêm trọng trong xã hội hiện nay. Nếu các giải pháp nêu trên được áp dụng đồng bộ, tình hình chắc chắn sẽ trở nên tốt đẹp hơn.',
            hint: 'Dùng mẫu kết bài tủ: "To sum up, brain drain is a serious problem in our lives. If the solutions above are applied, the situation will be much better."',
            keywords: ['To sum up', 'In conclusion', 'If the solutions above are applied'],
            grammarTip: 'Câu kết bài ăn điểm tuyệt đối cho mọi đề Solutions: "If the solutions above are applied, the situation will be better."',
            sample: 'To sum up, brain drain is a serious problem in our modern society. If the solutions above are applied effectively, the situation will certainly be better in the near future.'
          }
        ]
      },
      {
        id: 'vstep_b2_essay_vocational',
        type: 'VSTEP Task 2 • Dạng 2: Quan điểm (Opinion 50/50 - Agree or Disagree)',
        title: '3. Học Đại học hay Trường nghề (Vocational Training - Đề tủ số 3)',
        prompt: 'Too much emphasis is placed on going to university for academic study. People should be encouraged to do vocational training because there is a lack of qualified tradespeople such as electricians or plumbers. To what extent do you agree or disagree?',
        formulaNote: 'Chiến thuật Opinion 50/50 (Partly Agree): Mở bài (Nêu chủ đề + I partly agree with this opinion...) → Thân bài 1 (On the one hand: Lợi ích học Đại học) → Thân bài 2 (On the other hand: Lý do cần khuyến khích Trường nghề) → Kết bài.',
        sentences: [
          {
            section: 'Đoạn 1: Mở bài (Opinion 50/50)',
            vn: 'Đúng là việc vào đại học để theo đuổi con đường học thuật đóng vai trò quan trọng đối với nhiều bạn trẻ. Tuy nhiên, theo quan điểm của tôi, tôi đồng ý một phần với ý kiến này vì chúng ta cũng nên khuyến khích nhiều người tham gia đào tạo nghề.',
            hint: 'Dùng mẫu: "It is true that entering university for academic study plays an important role for young people. From my point of view, I partly agree with this opinion because we should also encourage people to attend vocational training."',
            keywords: ['entering university', 'partly agree', 'vocational training'],
            grammarTip: 'Mẫu câu Thesis cho đề Agree/Disagree viết theo hướng cân bằng 50/50 dễ đủ chữ: "From my point of view, I partly agree with this opinion because of the following reasons."',
            sample: 'It is true that entering university for an academic field plays an important role for many young people. From my point of view, I partly agree with this opinion because we should also encourage more people to pursue vocational training.'
          },
          {
            section: 'Đoạn 2: Thân bài 1 — Lợi ích của việc học Đại học',
            vn: 'Một mặt, có nhiều lý do tại sao hầu hết học sinh chọn học đại học. Trước hết, họ có thể mở rộng kiến thức chuyên sâu trong các lĩnh vực như luật, tài chính, y học hay ngân hàng.',
            hint: 'Dùng mẫu: "On the one hand, there are some reasons why most students choose universities. Firstly, they can broaden their knowledge in terms of law, finance, and banking."',
            keywords: ['On the one hand', 'broaden their knowledge', 'Firstly'],
            grammarTip: 'Cụm từ vựng B2 đắt giá: "broaden their knowledge" (mở rộng kiến thức).',
            sample: 'On the one hand, there are several reasons why many students choose universities to study. Firstly, they can broaden their theoretical knowledge in fields such as law, medicine, finance, and banking.'
          },
          {
            section: 'Đoạn 2: Lợi ích thứ 2 của Đại học',
            vn: 'Thứ hai, sinh viên tốt nghiệp đại học sẽ có nhiều cơ hội lựa chọn nghề nghiệp đa dạng hơn và tự tin hơn khi bước ra xã hội.',
            hint: 'Dùng mẫu: "Secondly, university graduates will have better career choices and feel more confident in society."',
            keywords: ['Secondly', 'career choices', 'confident'],
            grammarTip: 'Bổ sung ý thứ 2 cho đoạn Đại học.',
            sample: 'Secondly, university graduates often have wider career choices and higher social status when applying for professional positions.'
          },
          {
            section: 'Đoạn 3: Thân bài 2 — Tại sao nên khuyến khích Học nghề (Vocational training)',
            vn: 'Mặt khác, mọi người rất nên được khuyến khích tham gia các lớp đào tạo nghề. Lý do đầu tiên là họ có thể bắt đầu sự nghiệp sớm hơn vì trường nghề thường chỉ mất từ 1 đến 2 năm để lấy chứng chỉ hành nghề.',
            hint: 'Dùng mẫu: "On the other hand, people should be encouraged to attend vocational training classes. One reason is that they can start their careers sooner because vocational schools only take one to two years."',
            keywords: ['On the other hand', 'vocational', 'sooner', 'one to two years'],
            grammarTip: 'So sánh thời gian học đại học (3-4 năm) và học nghề (1-2 năm) bằng cấu trúc "while / whereas".',
            sample: 'On the other hand, people should be promoted to attend vocational training courses. One reason is that they can start their careers sooner since vocational schools usually take only one to two years to grant specialized certificates.'
          },
          {
            section: 'Đoạn 3: Lý do thứ 2 của Học nghề (Cân bằng thị trường lao động)',
            vn: 'Thêm vào đó, ở nhiều quốc gia đang có sự mất cân bằng khi cử nhân đại học thất nghiệp nhiều nhưng lại thiếu hụt trầm trọng thợ lành nghề như thợ điện hay thợ sửa ống nước.',
            hint: 'Dùng mẫu: "Furthermore, in many countries, there is graduate unemployment while there is a shortage of skilled tradespeople such as electricians or plumbers."',
            keywords: ['Furthermore', 'Also', 'unemployment', 'shortage of skilled'],
            grammarTip: 'Từ vựng B2 trong bài: "graduate unemployment" (thất nghiệp ở cử nhân), "shortage of skilled labor" (thiếu lao động lành nghề).',
            sample: 'Also, in many countries, there is a high rate of graduate unemployment while at the same time there is a serious shortage of skilled manual workers such as electricians and plumbers.'
          },
          {
            section: 'Đoạn 4: Kết bài (Conclusion)',
            vn: 'Tóm lại, học đại học chắc chắn là một con đường dẫn đến thành công; tuy nhiên, giáo dục nghề nghiệp cũng cần được nhà nước khuyến khích phát triển mạnh mẽ.',
            hint: 'Dùng mẫu: "To sum up, studying at a university is one of the paths to success; nevertheless, vocational education should also be strongly encouraged to develop."',
            keywords: ['To sum up', 'In conclusion', 'university', 'vocational education'],
            grammarTip: 'Tóm lược lại cả 2 vế để khớp với quan điểm 50/50.',
            sample: 'To sum up, it is certainly true that studying at a university is an important path to success; nevertheless, vocational education should also be strongly encouraged to meet social demands.'
          }
        ]
      },
      {
        id: 'vstep_b2_essay_airpollution',
        type: 'VSTEP Task 2 • Dạng 3: Hệ quả & Giải pháp (Effects & Solutions)',
        title: '4. Ô nhiễm không khí (Air Pollution - Đề tủ số 4)',
        prompt: 'Air pollution is one of the largest problems facing the world today. What are its problems (negative effects) and what measures (solutions) can be proposed to solve this problem? Write at least 250 words.',
        formulaNote: 'Công thức Effects - Solutions: Mở bài (Nêu vấn đề Air pollution + Thesis) → Thân bài 1 (Negative effects: Bệnh hô hấp/ung thư phổi & Nóng lên toàn cầu) → Thân bài 2 (Solutions: Chính phủ phạt nặng nhà máy & Người dân đi xe buýt công cộng) → Kết bài.',
        sentences: [
          {
            section: 'Đoạn 1: Mở bài (Introduction)',
            vn: 'Thế giới hiện đại đã phát triển nhanh chóng; tuy nhiên, ô nhiễm không khí đã dẫn đến vô số hệ lụy tiêu cực trong xã hội. Bài tiểu luận này sẽ thảo luận các tác hại chính của ô nhiễm không khí và đề xuất một số giải pháp để cải thiện tình hình.',
            hint: 'Dùng mẫu tài liệu: "The world has changed a lot; nonetheless, air pollution has led to plenty of problems in society. This essay will discuss the main negative effects related to air pollution and suggest several solutions to improve the situation."',
            keywords: ['air pollution', 'discuss', 'effects', 'Problems', 'solutions'],
            grammarTip: 'Áp dụng đúng khung Mở bài Effects - Solutions trong tài liệu ôn tập của bạn.',
            sample: 'The world has changed a lot; nonetheless, some negative changes have happened, and air pollution has led to plenty of problems in society. This essay will discuss the main negative effects of air pollution and suggest several solutions to improve the situation.'
          },
          {
            section: 'Đoạn 2: Thân bài 1 — Tác hại 1 (Sức khỏe con người)',
            vn: 'Trước hết, ô nhiễm không khí gây ra rất nhiều vấn đề nghiêm trọng về sức khỏe. Trên thực tế, ngày càng nhiều nhà máy mọc lên và thải ra các khí độc như khí mê-tan và CO2, làm ô nhiễm bầu không khí và dẫn đến các bệnh nguy hiểm như ung thư phổi.',
            hint: 'Dùng mẫu: "Firstly, air pollution has caused numerous health problems. In reality, more factories release toxic gases such as methane and carbon dioxide, which pollute the air and lead to lung cancer."',
            keywords: ['Firstly', 'health problems', 'factories', 'toxic gases', 'lung cancer'],
            grammarTip: 'Sử dụng mệnh đề quan hệ "which pollute the air and lead to..." để ăn điểm ngữ pháp B2.',
            sample: 'Firstly, air pollution has caused numerous health problems. In reality, more and more factories have been built and they release plenty of toxic gases such as methane and carbon dioxide, which pollute the air and lead to serious illnesses like lung cancer.'
          },
          {
            section: 'Đoạn 2: Tác hại 2 (Biến đổi khí hậu) + Ví dụ',
            vn: 'Thứ hai, ô nhiễm không khí làm gia tăng hiện tượng nóng lên toàn cầu do lượng khói bụi khổng lồ từ các phương tiện giao thông. Ví dụ, tại các đô thị lớn như Thành phố Hồ Chí Minh, tỷ lệ người mắc bệnh đường hô hấp rất cao do thường xuyên tiếp xúc với khói bụi độc hại.',
            hint: 'Dùng mẫu: "Secondly, air pollution increases global warming because of smoke from vehicles. For example, in big cities like Ho Chi Minh City, many people suffer from respiratory diseases due to regular exposure to toxic smoke."',
            keywords: ['Secondly', 'global warming', 'vehicles', 'For example', 'exposure to'],
            grammarTip: 'Cụm từ ăn điểm C1: "regular exposure to toxic smoke" (thường xuyên tiếp xúc với khói độc).',
            sample: 'Secondly, air pollution might increase global warming because of the huge amount of exhaust fumes from vehicles. For example, Ho Chi Minh City has a high rate of citizens suffering from respiratory problems due to regular exposure to toxic smoke.'
          },
          {
            section: 'Đoạn 3: Thân bài 2 — Giải pháp 1 (Trách nhiệm của Chính phủ)',
            vn: 'Tuy nhiên, có một số giải pháp khả thi cho vấn đề này. Đầu tiên, chính quyền nên ban hành luật nghiêm ngặt hơn và tăng gấp đôi mức phạt đối với các nhà máy không xử lý chất thải đúng quy định trước khi xả ra môi trường.',
            hint: 'Dùng mẫu: "However, there are several possible solutions. First, the government ought to release stricter laws and double the fine for factories that do not treat toxins properly before releasing them into the air."',
            keywords: ['However', 'solutions', 'stricter laws', 'factories'],
            grammarTip: 'Cụm từ vựng trong tài liệu: "release stricter laws" (ban hành luật nghiêm hơn), "treat the toxins properly" (xử lý chất độc đúng cách).',
            sample: 'However, there are several possible solutions to the main problems. First, the government ought to release stricter laws and double the fine for factories that do not treat toxins properly before releasing them into the air.'
          },
          {
            section: 'Đoạn 3: Giải pháp 2 (Ý thức của mỗi cá nhân)',
            vn: 'Thứ hai, mỗi cá nhân nên chung tay bảo vệ môi trường bằng cách sử dụng phương tiện giao thông công cộng như xe buýt để đi học và đi làm thay vì đi xe máy hay ô tô riêng.',
            hint: 'Dùng mẫu: "Second, each person should share their duty by using public transport such as buses to work or school rather than using private cars or motorbikes."',
            keywords: ['Second', 'public', 'transport', 'buses', 'private'],
            grammarTip: 'Cấu trúc "by + V-ing ... rather than + V-ing" (bằng cách làm gì... thay vì làm gì).',
            sample: 'Second, each individual should share their duty by using public means of transport such as buses to go to work or school rather than using private cars or motorbikes.'
          },
          {
            section: 'Đoạn 4: Kết bài (Conclusion)',
            vn: 'Tóm lại, ô nhiễm không khí đã gây ra nhiều hệ lụy tiêu cực trong xã hội hiện đại và con người cần giải quyết càng sớm càng tốt. Nếu các giải pháp trên được áp dụng, bầu không khí sẽ trở nên trong lành hơn.',
            hint: 'Dùng mẫu: "In conclusion, air pollution has led to plenty of negative issues in modern society. If the solutions above are applied, the situation will be better."',
            keywords: ['In conclusion', 'negative', 'If the solutions above are applied'],
            grammarTip: 'Khép lại bài luận bằng công thức kết bài chuẩn VSTEP.',
            sample: 'In conclusion, air pollution has led to plenty of negative issues in our modern society and human beings had better pay attention to solve it as soon as possible. If the solutions above are applied, the situation will be better.'
          }
        ]
      }
    ]
  };

  let curTopicIdx = 0;
  let curSentIdx = 0;

  function getProgressStore(state) {
    if (!state.drafts) state.drafts = {};
    if (!state.drafts.vstepSentProg) state.drafts.vstepSentProg = {};
    return state.drafts.vstepSentProg;
  }

  function getTopicState(state, topicId, totalSentences) {
    const store = getProgressStore(state);
    if (!store[topicId]) {
      store[topicId] = {
        activeIdx: 0,
        sentences: {} // idx -> { text: '', passed: false, score: 0, feedback: '' }
      };
    }
    const st = store[topicId];
    if (typeof st.activeIdx !== 'number' || st.activeIdx < 0 || st.activeIdx >= totalSentences) {
      st.activeIdx = 0;
    }
    return st;
  }

  // Đánh giá nhanh cục bộ (kết hợp từ khóa, độ dài, cấu trúc) trước khi gọi AI
  function localEvaluateSentence(userText, sentObj) {
    const clean = String(userText || '').trim();
    const words = clean.split(/\s+/).filter(Boolean);
    const wc = words.length;

    if (wc < 4) {
      return {
        passed: false,
        score: 3.0,
        matchedKw: [],
        missingKw: sentObj.keywords || [],
        quickMsg: 'Câu còn quá ngắn. Bạn hãy viết thành một câu tiếng Anh hoàn chỉnh (có Chủ ngữ + Động từ) nhé!'
      };
    }

    const lower = clean.toLowerCase();
    const kws = sentObj.keywords || [];
    const matchedKw = [];
    const missingKw = [];

    kws.forEach((kw) => {
      const firstToken = kw.toLowerCase().split(/\s+/)[0];
      if (lower.includes(kw.toLowerCase()) || (firstToken.length > 3 && lower.includes(firstToken))) {
        matchedKw.push(kw);
      } else {
        missingKw.push(kw);
      }
    });

    // So sánh độ tương đồng từ vựng với câu mẫu
    const cmp = global.LexiAcademy.compareTokens(sentObj.sample, clean);
    let score = 6.0;
    if (wc >= 8) score += 1.0;
    if (matchedKw.length >= 1) score += 1.0;
    if (matchedKw.length >= 2) score += 0.5;
    if (cmp.pct >= 35) score += 0.5;
    if (/^[A-Z]/.test(clean) && /[.!?]$/.test(clean)) score += 0.5;
    score = Math.min(9.5, score);

    const passed = wc >= 6 && (matchedKw.length >= 1 || cmp.pct >= 30 || score >= 7.0);

    return {
      passed,
      score: score.toFixed(1),
      matchedKw,
      missingKw,
      quickMsg: passed
        ? '✅ Câu của bạn đã đạt chỉ tiêu về ý nghĩa và cấu trúc VSTEP! Bạn có thể bấm "Qua câu tiếp theo" hoặc xem góp ý tinh chỉnh từ AI bên dưới.'
        : '⚠️ Câu đã có ý nhưng nên bổ sung từ nối/cấu trúc gợi ý để ăn điểm VSTEP cao hơn.'
    };
  }

  function render(lv, state) {
    const list = WRITING_DATA[lv] || WRITING_DATA.B1;
    if (curTopicIdx >= list.length) curTopicIdx = 0;
    const item = list[curTopicIdx];
    const tState = getTopicState(state, item.id, item.sentences.length);
    curSentIdx = tState.activeIdx;
    const curSent = item.sentences[curSentIdx];
    const curSaved = tState.sentences[curSentIdx] || { text: '', passed: false, feedback: '' };
    const esc = global.LexiAcademy.esc;

    // Tính số câu đã hoàn thành
    let passedCount = 0;
    item.sentences.forEach((_, idx) => {
      if (tState.sentences[idx] && tState.sentences[idx].passed) passedCount++;
    });
    const allCompleted = passedCount === item.sentences.length;

    // Ghép toàn bộ các câu đã viết thành đoạn văn hoàn chỉnh
    const assembledEssay = item.sentences
      .map((s, idx) => (tState.sentences[idx] && tState.sentences[idx].text ? tState.sentences[idx].text.trim() : ''))
      .filter(Boolean)
      .join(' ');
    const totalWords = assembledEssay ? assembledEssay.split(/\s+/).length : 0;

    return `
      <div class="space-y-4">
        <!-- THANH CHỌN ĐỀ BÀI VSTEP -->
        <div class="card p-4 space-y-3 border-pri/30">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span class="text-xs font-mono text-pri font-bold uppercase">📚 KHO ĐỀ TỦ VSTEP WRITING (${lv === 'B1' ? 'TASK 1: VIẾT THƯ/EMAIL' : 'TASK 2: VIẾT LUẬN ESSAY'})</span>
              <h3 class="text-base sm:text-lg font-bold mt-0.5">${esc(item.title)}</h3>
            </div>
            <div class="flex items-center gap-2">
              <span class="px-3 py-1 rounded-full text-xs font-mono font-bold ${allCompleted ? 'bg-ok/20 text-ok border border-ok/40' : 'bg-pri/15 text-pri border border-pri/30'}">
                Tiến độ: ${passedCount}/${item.sentences.length} câu (${Math.round((passedCount / item.sentences.length) * 100)}%)
              </span>
              <button type="button" id="wrt-reset-topic" class="btn !text-xs text-mute" title="Làm lại đề này từ câu 1">🔄 Làm lại đề này</button>
            </div>
          </div>

          <!-- Danh sách nút chuyển đề -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
            ${list.map((it, idx) => {
              const st = getTopicState(state, it.id, it.sentences.length);
              const doneCnt = it.sentences.filter((_, si) => st.sentences[si] && st.sentences[si].passed).length;
              const isCurrent = idx === curTopicIdx;
              return `
                <button type="button" data-wrt-topic="${idx}" class="text-left p-2.5 rounded-xl border transition ${
                  isCurrent ? 'border-pri bg-pri/15 font-bold ring-2 ring-pri/40' : 'border-line/60 hover:bg-line/20'
                } text-xs flex flex-col justify-between gap-1">
                  <div class="font-semibold line-clamp-1">${esc(it.title)}</div>
                  <div class="flex items-center justify-between text-[10px] text-mute">
                    <span>${it.sentences.length} câu</span>
                    <span class="${doneCnt === it.sentences.length ? 'text-ok font-bold' : 'text-pri'}">${doneCnt}/${it.sentences.length} ✓</span>
                  </div>
                </button>
              `;
            }).join('')}
          </div>

          <!-- Đề bài & Công thức VSTEP -->
          <div class="inset p-3 text-xs space-y-1.5 leading-relaxed">
            <div><b class="text-warn">📌 Đề bài VSTEP:</b> ${esc(item.prompt)}</div>
            <div class="text-ok"><b>💡 Bí kíp / Khung Template áp dụng:</b> ${esc(item.formulaNote)}</div>
          </div>
        </div>

        <!-- GIAO DIỆN CHIA ĐÔI MÀN HÌNH (SPLIT-SCREEN): TRÁI (DÀN Ý CHẠY CÂU) - PHẢI (VIẾT & AI CHẤM TỪNG CÂU) -->
        <div class="grid lg:grid-cols-12 gap-4 items-start">
          
          <!-- CỘT BÊN TRÁI (5/12): ĐOẠN VĂN DÀN Ý TIẾNG VIỆT & HIỆU ỨNG CHẠY CÂU -->
          <div class="lg:col-span-5 card p-4 sm:p-5 space-y-3 border-pri/40 lg:sticky lg:top-20">
            <div class="flex items-center justify-between border-b border-line/60 pb-2.5">
              <div>
                <b class="text-sm flex items-center gap-1.5">🇻🇳 Dàn bài Tiếng Việt (Hiệu ứng Chạy câu)</b>
                <p class="text-[11px] text-mute mt-0.5">Câu đang xử lý sẽ sáng nổi bật • Chạm vào câu bất kỳ để chuyển nhanh</p>
              </div>
              <span class="px-2 py-0.5 rounded text-[11px] font-mono bg-warn/20 text-warn font-bold">Câu ${curSentIdx + 1}/${item.sentences.length}</span>
            </div>

            <!-- Luồng đoạn văn tiếng Việt với hiệu ứng Highlight câu đang chạy -->
            <div class="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
              ${item.sentences.map((s, idx) => {
                const sData = tState.sentences[idx] || {};
                const isActive = idx === curSentIdx;
                const isPassed = !!sData.passed;
                const prevSection = idx > 0 ? item.sentences[idx - 1].section : '';
                const showSecHeader = s.section !== prevSection;

                return `
                  ${showSecHeader ? `<div class="text-[11px] font-bold uppercase tracking-wider text-pri pt-2 first:pt-0">${esc(s.section)}</div>` : ''}
                  <div data-wrt-jump="${idx}" class="cursor-pointer p-3 rounded-xl border transition-all duration-200 ${
                    isActive
                      ? 'border-warn bg-warn/15 ring-2 ring-warn/50 shadow-lg scale-[1.01]'
                      : isPassed
                      ? 'border-ok/40 bg-ok/10 opacity-90 hover:opacity-100'
                      : 'border-line/50 bg-inset/60 opacity-60 hover:opacity-90'
                  }">
                    <div class="flex items-center justify-between gap-2 mb-1">
                      <span class="text-[11px] font-mono font-bold ${
                        isActive ? 'text-warn' : isPassed ? 'text-ok' : 'text-mute'
                      }">
                        ${isActive ? '👉 ĐANG VIẾT CÂU ' + (idx + 1) : isPassed ? '✓ ĐÃ ĐẠT CÂU ' + (idx + 1) : '• Câu ' + (idx + 1)}
                      </span>
                      ${sData.score ? `<span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-ok/20 text-ok font-bold">${sData.score}/10</span>` : ''}
                    </div>
                    <p class="text-xs sm:text-sm leading-relaxed ${isActive ? 'font-bold text-fg' : 'text-fg/90'}">
                      "${esc(s.vn)}"
                    </p>
                    ${
                      sData.text
                        ? `<div class="mt-2 pt-1.5 border-t border-line/40 text-xs font-mono text-ok flex items-start gap-1.5">
                             <span>🇬🇧</span>
                             <span class="italic">${esc(sData.text)}</span>
                           </div>`
                        : ''
                    }
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- CỘT BÊN PHẢI (7/12): KHU VỰC TƯƠNG TÁC VIẾT TIẾNG ANH & GIA SƯ AI PHẢN HỒI TRỰC TIẾP -->
          <div class="lg:col-span-7 space-y-4">
            <div class="card p-4 sm:p-5 space-y-4 border-warn/40">
              <!-- Tiêu đề câu đang xử lý -->
              <div class="flex flex-wrap items-center justify-between gap-2 border-b border-line/60 pb-3">
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-1 rounded-lg bg-warn text-slate-950 font-bold text-xs font-mono">
                    ĐANG XỬ LÝ CÂU ${curSentIdx + 1} / ${item.sentences.length}
                  </span>
                  <span class="text-xs font-semibold text-pri">${esc(curSent.section)}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <button type="button" id="wrt-prev-sent" class="btn !py-1 !px-2.5 !text-xs" ${curSentIdx === 0 ? 'disabled' : ''}>← Câu trước</button>
                  <button type="button" id="wrt-next-sent" class="btn !py-1 !px-2.5 !text-xs" ${curSentIdx === item.sentences.length - 1 ? 'disabled' : ''}>Câu tiếp →</button>
                </div>
              </div>

              <!-- Câu tiếng Việt mục tiêu cần chuyển sang tiếng Anh -->
              <div class="inset p-3.5 rounded-xl border-l-4 border-warn space-y-1.5">
                <div class="text-[11px] font-bold text-warn uppercase">🎯 Ý Tiếng Việt cần diễn đạt sang Tiếng Anh:</div>
                <div class="text-sm sm:text-base font-bold leading-relaxed text-fg">"${esc(curSent.vn)}"</div>
              </div>

              <!-- Gợi ý Từ vựng / Cấu trúc ngữ pháp VSTEP cho câu này -->
              <div class="inset p-3 rounded-xl space-y-2 text-xs">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <b class="text-pri">💡 Gợi ý cấu trúc & Từ khóa ăn điểm VSTEP (Bấm để chèn nhanh):</b>
                </div>
                <div class="flex flex-wrap gap-1.5">
                  ${(curSent.keywords || []).map((kw) => `
                    <button type="button" data-wrt-kw="${esc(kw)}" class="px-2.5 py-1 rounded-lg border border-pri/40 bg-pri/10 text-pri font-mono text-xs hover:bg-pri/20 transition">
                      + ${esc(kw)}
                    </button>
                  `).join('')}
                </div>
                <div class="text-mute leading-relaxed pt-1 border-t border-line/40">
                  <div><b>📐 Mẹo ngữ pháp:</b> ${esc(curSent.grammarTip)}</div>
                  <div class="mt-1"><b>🧩 Khung gợi ý:</b> <span class="text-ok font-mono">${esc(curSent.hint)}</span></div>
                </div>
              </div>

              <!-- Ô nhập câu tiếng Anh của người học -->
              <div class="space-y-2">
                <div class="flex items-center justify-between text-xs">
                  <label for="wrt-sent-input" class="font-bold text-fg">✍️ Viết câu Tiếng Anh của bạn tương ứng với câu số ${curSentIdx + 1}:</label>
                  <button type="button" id="wrt-use-sample" class="text-pri hover:underline font-medium">✨ Điền câu mẫu tham khảo</button>
                </div>
                <textarea
                  id="wrt-sent-input"
                  rows="3"
                  class="inp text-sm sm:text-base font-medium leading-relaxed border-pri/50 focus:border-pri"
                  placeholder="Nhập câu tiếng Anh của bạn tại đây (ví dụ: ${esc(curSent.sample.slice(0, 48))}...)"
                >${esc(curSaved.text || '')}</textarea>

                <!-- Các nút hành động: Chấm AI từng câu & Qua câu tiếp theo -->
                <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <button type="button" id="wrt-eval-sent-btn" class="btn btn-pri font-bold !py-2.5 !px-4 shadow-md">
                      🤖 AI Đánh giá & Sửa câu ${curSentIdx + 1}
                    </button>
                    <button type="button" id="wrt-speak-sample-btn" class="btn !py-2" data-a="speak" data-v="${esc(curSent.sample)}">
                      🔊 Nghe câu chuẩn
                    </button>
                  </div>

                  <button
                    type="button"
                    id="wrt-pass-next-btn"
                    class="btn ${curSaved.passed ? 'btn-ok font-bold ring-2 ring-ok/50' : ''} !py-2.5 !px-4"
                  >
                    ${curSentIdx < item.sentences.length - 1 ? '✅ Đạt chỉ tiêu → Qua câu tiếp theo (' + (curSentIdx + 2) + ')' : '🎉 Hoàn tất bài viết'}
                  </button>
                </div>
              </div>

              <!-- KHU VỰC PHẢN HỒI CỦA GIA SƯ AI CHO CÂU HIỆN TẠI -->
              <div id="wrt-sent-feedback" class="${curSaved.feedback ? '' : 'hidden'} inset p-4 rounded-xl space-y-3 border border-ok/40 text-xs sm:text-sm">
                ${curSaved.feedback || ''}
              </div>
            </div>

            <!-- BẢN GHÉP HOÀN CHỈNH TOÀN BÀI (TỰ ĐỘNG CẬP NHẬT KHI VIẾT XONG TỪNG CÂU) -->
            <div class="card p-4 sm:p-5 space-y-3 border-ok/30">
              <div class="flex flex-wrap items-center justify-between gap-2 border-b border-line/60 pb-2.5">
                <div>
                  <b class="text-sm text-ok flex items-center gap-1.5">📜 Bài viết Tiếng Anh hoàn chỉnh của bạn (Ghép tự động từng câu)</b>
                  <p class="text-[11px] text-mute">Khi bạn hoàn thành từng câu ở trên, bài viết hoàn chỉnh sẽ tự động nối lại tại đây.</p>
                </div>
                <span class="font-mono text-xs font-bold ${totalWords >= (lv === 'B2' ? 180 : 100) ? 'text-ok' : 'text-warn'}">
                  Tổng: ${totalWords} từ
                </span>
              </div>

              <div class="inset p-3.5 rounded-xl text-xs sm:text-sm leading-relaxed whitespace-pre-line font-mono min-h-[80px]">
                ${
                  assembledEssay
                    ? esc(assembledEssay)
                    : '<span class="text-mute italic">Chưa có câu nào được lưu. Hãy viết câu số 1 ở khung phía trên nhé!</span>'
                }
              </div>

              <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex flex-wrap gap-2">
                  <button type="button" id="wrt-copy-full" class="btn !text-xs">📋 Sao chép toàn bài</button>
                  <button type="button" id="wrt-toggle-full-model" class="btn !text-xs text-ok border-ok/40">🌟 Xem toàn bộ Bài mẫu VSTEP chuẩn</button>
                </div>
                ${
                  assembledEssay
                    ? `<button type="button" class="btn !text-xs" data-a="speak" data-v="${esc(assembledEssay)}">🔊 Nghe toàn bài của bạn</button>`
                    : ''
                }
              </div>

              <div id="wrt-full-model-box" class="hidden inset p-4 rounded-xl space-y-2 border border-ok/40 text-xs sm:text-sm">
                <div class="flex items-center justify-between">
                  <b class="text-ok uppercase text-xs">🌟 Toàn bộ bài viết mẫu VSTEP (${lv})</b>
                  <button type="button" class="btn !text-xs" data-a="speak" data-v="${esc(item.sentences.map((s) => s.sample).join(' '))}">🔊 Nghe bài mẫu</button>
                </div>
                <div class="leading-relaxed space-y-2">
                  ${item.sentences.map((s, idx) => `<p><b>(${idx + 1})</b> ${esc(s.sample)}</p>`).join('')}
                </div>
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

    // Chọn đề bài khác
    container.querySelectorAll('[data-wrt-topic]').forEach((btn) => {
      btn.onclick = () => {
        curTopicIdx = Number(btn.getAttribute('data-wrt-topic'));
        global.LexiAcademy.render();
      };
    });

    // Làm lại đề hiện tại
    const resetBtn = container.querySelector('#wrt-reset-topic');
    if (resetBtn) {
      resetBtn.onclick = () => {
        const store = getProgressStore(state);
        store[item.id] = { activeIdx: 0, sentences: {} };
        global.LexiAcademy.saveState();
        global.LexiAcademy.notify('🔄 Đã đặt lại tiến độ đề bài về Câu 1.');
        global.LexiAcademy.render();
      };
    }

    // Nhảy tới câu bất kỳ khi bấm vào cột bên trái
    container.querySelectorAll('[data-wrt-jump]').forEach((cardEl) => {
      cardEl.onclick = () => {
        const targetIdx = Number(cardEl.getAttribute('data-wrt-jump'));
        tState.activeIdx = targetIdx;
        global.LexiAcademy.saveState();
        global.LexiAcademy.render();
      };
    });

    // Nút Câu trước / Câu tiếp
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

    // Lưu nháp tự động khi gõ câu
    if (sentInput) {
      sentInput.addEventListener('input', () => {
        if (!tState.sentences[curSentIdx]) {
          tState.sentences[curSentIdx] = { text: '', passed: false, feedback: '' };
        }
        tState.sentences[curSentIdx].text = sentInput.value;
        global.LexiAcademy.saveState();
      });
    }

    // Bấm chèn từ khóa gợi ý
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

    // Điền câu mẫu tham khảo
    const sampleBtn = container.querySelector('#wrt-use-sample');
    if (sampleBtn && sentInput) {
      sampleBtn.onclick = () => {
        sentInput.value = curSent.sample;
        sentInput.dispatchEvent(new Event('input'));
        sentInput.focus();
      };
    }

    // Nút Qua câu tiếp theo
    const passNextBtn = container.querySelector('#wrt-pass-next-btn');
    if (passNextBtn) {
      passNextBtn.onclick = () => {
        const txt = sentInput ? sentInput.value.trim() : '';
        if (txt.length < 5) {
          global.LexiAcademy.notify('✍️ Bạn hãy viết câu tiếng Anh hoặc bấm "Điền câu mẫu tham khảo" trước khi qua câu tiếp theo nhé!');
          if (sentInput) sentInput.focus();
          return;
        }
        if (!tState.sentences[curSentIdx]) tState.sentences[curSentIdx] = {};
        tState.sentences[curSentIdx].text = txt;
        tState.sentences[curSentIdx].passed = true;
        if (!tState.sentences[curSentIdx].score) tState.sentences[curSentIdx].score = '8.5';

        // Kiểm tra xem đã xong hết các câu chưa
        const allDone = item.sentences.every((_, i) => tState.sentences[i] && tState.sentences[i].passed);
        if (allDone) {
          global.LexiAcademy.markDone(item.id);
          global.LexiAcademy.notify('🎉 Chúc mừng! Bạn đã hoàn thành xuất sắc toàn bộ các câu của bài viết VSTEP này!');
        }

        if (curSentIdx < item.sentences.length - 1) {
          tState.activeIdx = curSentIdx + 1;
          global.LexiAcademy.saveState();
          global.LexiAcademy.render();
        } else {
          global.LexiAcademy.saveState();
          global.LexiAcademy.render();
        }
      };
    }

    // Nút AI Đánh giá & Sửa lỗi trực tiếp cho câu hiện tại
    const evalBtn = container.querySelector('#wrt-eval-sent-btn');
    if (evalBtn && sentInput && fbBox) {
      evalBtn.onclick = async () => {
        const userTxt = sentInput.value.trim();
        if (userTxt.length < 4) {
          global.LexiAcademy.notify('✍️ Hãy viết ít nhất vài từ tiếng Anh cho câu này để AI đánh giá nhé!');
          sentInput.focus();
          return;
        }

        const localRes = localEvaluateSentence(userTxt, curSent);
        if (!tState.sentences[curSentIdx]) tState.sentences[curSentIdx] = {};
        tState.sentences[curSentIdx].text = userTxt;
        tState.sentences[curSentIdx].passed = localRes.passed;
        tState.sentences[curSentIdx].score = localRes.score;

        const baseFeedbackHTML = `
          <div class="space-y-2.5">
            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-line/60 pb-2">
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${localRes.passed ? 'bg-ok/20 text-ok' : 'bg-warn/20 text-warn'}">
                  ${localRes.passed ? '✓ ĐẠT CHỈ TIÊU CÂU ' + (curSentIdx + 1) : '⚠️ CẦN TINH CHỈNH THÊM'}
                </span>
                <b class="text-sm">Điểm câu: ~${localRes.score}/10 VSTEP</b>
              </div>
              ${
                localRes.passed && curSentIdx < item.sentences.length - 1
                  ? `<button type="button" id="wrt-fb-next-btn" class="btn btn-ok !py-1 !px-3 !text-xs font-bold">Qua câu ${curSentIdx + 2} →</button>`
                  : ''
              }
            </div>

            <div class="text-xs leading-relaxed">${localRes.quickMsg}</div>

            <div class="grid sm:grid-cols-2 gap-2 text-xs">
              <div class="p-2.5 rounded-lg bg-ok/10 border border-ok/30">
                <div class="font-bold text-ok mb-0.5">🌟 Câu mẫu chuẩn VSTEP:</div>
                <div class="font-mono text-fg">${esc(curSent.sample)}</div>
              </div>
              <div class="p-2.5 rounded-lg bg-pri/10 border border-pri/30">
                <div class="font-bold text-pri mb-0.5">🔑 Từ khóa/Cấu trúc đã dùng:</div>
                <div>${
                  localRes.matchedKw.length
                    ? `<span class="text-ok font-semibold">${esc(localRes.matchedKw.join(', '))}</span>`
                    : '<span class="text-warn">Chưa thấy từ khóa gợi ý. Hãy thử dùng: ' + esc((curSent.keywords || []).join(', ')) + '</span>'
                }</div>
              </div>
            </div>

            <div id="wrt-ai-live-review" class="text-xs text-mute pt-2 border-t border-line/50">
              🤖 <i>Gia sư AI đang phân tích chi tiết ngữ pháp & cách dùng từ trong câu của bạn...</i>
            </div>
          </div>
        `;

        fbBox.classList.remove('hidden');
        fbBox.innerHTML = baseFeedbackHTML;
        tState.sentences[curSentIdx].feedback = baseFeedbackHTML;
        global.LexiAcademy.saveState();

        const bindQuickNext = () => {
          const qNext = fbBox.querySelector('#wrt-fb-next-btn');
          if (qNext && passNextBtn) {
            qNext.onclick = () => passNextBtn.click();
          }
        };
        bindQuickNext();

        // Gọi Gia sư AI chấm chi tiết từng câu
        if (typeof global.rawAi === 'function') {
          try {
            const prompt = `Bạn là giám khảo chấm thi VSTEP Writing (${lv}). Học viên đang luyện dịch và viết từng câu:
- Ý tiếng Việt cần diễn đạt: "${curSent.vn}"
- Câu mẫu chuẩn VSTEP: "${curSent.sample}"
- Câu học viên viết: "${userTxt}"

Hãy nhận xét cực kỳ ngắn gọn, súc tích (tối đa 4 gạch đầu dòng bằng tiếng Việt):
1. Đánh giá câu của học viên đã đúng ngữ pháp và sát nghĩa tiếng Việt chưa? (Đạt bao nhiêu % chỉ tiêu).
2. Sửa lỗi sai từ vựng / ngữ pháp (nếu có).
3. Gợi ý 1 câu viết lại hoàn chỉnh, tự nhiên và ăn điểm VSTEP ${lv} cao nhất.`;

            const aiText = await global.rawAi(prompt);
            const liveEl = fbBox.querySelector('#wrt-ai-live-review');
            if (liveEl && aiText) {
              const formattedAi = esc(aiText)
                .replace(/\*\*(.+?)\*\*/g, '<b class="text-pri">$1</b>')
                .replace(/\n/g, '<br>');
              liveEl.className = 'text-xs leading-relaxed pt-2 border-t border-line/50 text-fg space-y-1';
              liveEl.innerHTML = `<div class="font-bold text-pri mb-1">🤖 Nhận xét chi tiết từ Gia sư AI:</div><div>${formattedAi}</div>`;
              tState.sentences[curSentIdx].feedback = fbBox.innerHTML;
              global.LexiAcademy.saveState();
              bindQuickNext();
            }
          } catch (err) {
            const liveEl = fbBox.querySelector('#wrt-ai-live-review');
            if (liveEl) {
              liveEl.innerHTML = `💡 <b>Mẹo VSTEP:</b> ${esc(curSent.grammarTip)}`;
              tState.sentences[curSentIdx].feedback = fbBox.innerHTML;
              global.LexiAcademy.saveState();
            }
          }
        }
      };
    }

    // Sao chép toàn bài
    const copyFullBtn = container.querySelector('#wrt-copy-full');
    if (copyFullBtn) {
      copyFullBtn.onclick = () => {
        const fullTxt = item.sentences
          .map((_, idx) => (tState.sentences[idx] && tState.sentences[idx].text ? tState.sentences[idx].text.trim() : ''))
          .filter(Boolean)
          .join(' ');
        if (!fullTxt) {
          global.LexiAcademy.notify('Chưa có câu nào để sao chép!');
          return;
        }
        if (navigator.clipboard) {
          navigator.clipboard.writeText(fullTxt);
          global.LexiAcademy.notify('📋 Đã sao chép toàn bộ bài viết vào bộ nhớ tạm!');
        }
      };
    }

    // Ẩn/Hiện toàn bộ bài mẫu
    const toggleModelBtn = container.querySelector('#wrt-toggle-full-model');
    const fullModelBox = container.querySelector('#wrt-full-model-box');
    if (toggleModelBtn && fullModelBox) {
      toggleModelBtn.onclick = () => {
        fullModelBox.classList.toggle('hidden');
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
