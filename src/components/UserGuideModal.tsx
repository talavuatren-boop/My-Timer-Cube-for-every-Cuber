import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Timer as TimerIcon,
  Box,
  Layers,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  Zap,
  Share2,
  Heart,
  Plus,
  Play,
  RotateCcw,
  Compass,
  Award,
} from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<
    'quickstart' | 'timer' | 'cube3d' | 'diagrams' | 'cfop' | 'custom' | 'notation'
  >('quickstart');

  if (!isOpen) return null;

  const sections = [
    { id: 'quickstart', label: 'Bắt đầu nhanh', icon: <Sparkles className="w-4 h-4 text-teal-400" /> },
    { id: 'timer', label: 'Bộ đếm giờ (Timer)', icon: <TimerIcon className="w-4 h-4 text-emerald-400" /> },
    { id: 'cube3d', label: '3D Cube & Scramble', icon: <Box className="w-4 h-4 text-cyan-400" /> },
    { id: 'diagrams', label: 'Cách đọc Diagram OLL & PLL', icon: <Layers className="w-4 h-4 text-amber-400" /> },
    { id: 'cfop', label: 'Luyện tập CFOP & Trainer', icon: <Award className="w-4 h-4 text-purple-400" /> },
    { id: 'custom', label: 'Tạo Case & Community', icon: <Share2 className="w-4 h-4 text-rose-400" /> },
    { id: 'notation', label: 'Bảng ký hiệu Notation', icon: <Compass className="w-4 h-4 text-blue-400" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-neutral-100 max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                Hướng Dẫn Sử Dụng HungCube PRO
              </h3>
              <p className="text-[11px] text-neutral-400">
                Cẩm nang toàn diện về Timer WCA, Khối 3D, Thư viện OLL/PLL và Luyện tập Speedcubing
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs (Scrollable on Mobile) */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-950 rounded-2xl border border-neutral-800 text-xs overflow-x-auto scrollbar-none max-w-full shrink-0">
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id as any)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeSection === sec.id
                  ? 'bg-neutral-800 text-teal-300 font-bold border border-teal-500/30 shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {sec.icon}
              <span>{sec.label}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-5 text-xs text-neutral-300 leading-relaxed">
          {/* SECTION 1: QUICKSTART */}
          {activeSection === 'quickstart' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-teal-950/40 border border-teal-500/30 flex flex-col gap-2">
                <span className="text-sm font-bold text-teal-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Chào mừng bạn đến với HungCube PRO!
                </span>
                <p className="text-neutral-300">
                  HungCube là nền tảng luyện tập Rubik chuẩn thi đấu thế giới (WCA), tích hợp đầy đủ công cụ cho speedcuber từ người mới bắt đầu đến trình độ sub-10.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="p-3.5 bg-neutral-950/70 rounded-2xl border border-neutral-800/80 flex flex-col gap-1.5">
                  <span className="font-semibold text-neutral-100 flex items-center gap-1.5">
                    <TimerIcon className="w-4 h-4 text-emerald-400" />
                    1. Giải Rubik & Bấm Giờ
                  </span>
                  <p className="text-neutral-400 text-[11px]">
                    Vào tab <strong>Timer</strong>, xáo khối Rubik thật theo chuỗi Scramble trên màn hình. Giữ phím Cách (Space) hoặc ngón tay đến khi đồng hồ chuyển xanh, thả ra để bắt đầu giải!
                  </p>
                </div>

                <div className="p-3.5 bg-neutral-950/70 rounded-2xl border border-neutral-800/80 flex flex-col gap-1.5">
                  <span className="font-semibold text-neutral-100 flex items-center gap-1.5">
                    <Box className="w-4 h-4 text-cyan-400" />
                    2. Xem Khối 3D & Scramble
                  </span>
                  <p className="text-neutral-400 text-[11px]">
                    Tab <strong>3D Cube</strong> cho phép xoay camera 3D, chạy từng bước thuật toán, thử move thủ công ($R, L, U, D, M, R2...$) và lưu trữ các scramble yêu thích.
                  </p>
                </div>

                <div className="p-3.5 bg-neutral-950/70 rounded-2xl border border-neutral-800/80 flex flex-col gap-1.5">
                  <span className="font-semibold text-neutral-100 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-amber-400" />
                    3. Thư viện CFOP & Case
                  </span>
                  <p className="text-neutral-400 text-[11px]">
                    Tab <strong>Algorithms</strong> chứa đầy đủ 57 OLL, 21 PLL, 41 F2L, 2-Look và Custom Cases. Bấm vào case bất kỳ để xem mô hình 3D chạy giải mẫu và sơ đồ 2D nhận diện màu.
                  </p>
                </div>

                <div className="p-3.5 bg-neutral-950/70 rounded-2xl border border-neutral-800/80 flex flex-col gap-1.5">
                  <span className="font-semibold text-neutral-100 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-purple-400" />
                    4. Luyện Phản Xạ (Drills)
                  </span>
                  <p className="text-neutral-400 text-[11px]">
                    Tab <strong>Drills</strong> hiển thị hình ảnh case chưa giải. Bạn sẽ nhận diện dạng khối, thử nhớ công thức trong đầu, bấm "Reveal" để kiểm tra và bấm giờ thực hành.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: TIMER */}
          {activeSection === 'timer' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-150">
              <h4 className="font-bold text-sm text-emerald-400 flex items-center gap-1.5">
                <TimerIcon className="w-4 h-4" />
                Hướng Dẫn Sử Dụng Bộ Đếm Giờ (Speedcubing Timer)
              </h4>

              <div className="flex flex-col gap-3">
                <div className="p-3.5 bg-neutral-950 rounded-2xl border border-neutral-800 flex flex-col gap-1.5">
                  <span className="font-semibold text-neutral-200">Cách Bắt Đầu và Dừng Đồng Hồ:</span>
                  <ul className="list-disc list-inside text-neutral-400 space-y-1 text-[11px]">
                    <li><strong>Trên máy tính:</strong> Giữ phím <strong>Spacebar</strong> (khoảng 0.3s) cho đến khi chữ số chuyển sang màu xanh lá (Ready), sau đó <strong>thả tay</strong> để đếm giờ. Khi giải xong khối, bấm phím bất kỳ hoặc Spacebar để dừng.</li>
                    <li><strong>Trên điện thoại:</strong> <strong>Chạm và giữ</strong> ngón tay vào màn hình cho đến khi đồng hồ chuyển xanh, thả tay ra để giải. Khi giải xong, chạm nhẹ vào màn hình để dừng lại.</li>
                  </ul>
                </div>

                <div className="p-3.5 bg-neutral-950 rounded-2xl border border-neutral-800 flex flex-col gap-1.5">
                  <span className="font-semibold text-neutral-200">Quy Chuẩn Quan Sát WCA 15s (Inspection):</span>
                  <p className="text-neutral-400 text-[11px]">
                    Khi bật tùy chọn <strong>WCA Inspection</strong> trong Settings hoặc Quick Settings: Sau khi chạm màn hình, bạn có 15 giây để quan sát khối Rubik trước khi giải. Đồng hồ sẽ phát âm thanh cảnh báo ở giây thứ <strong>8s</strong> và <strong>12s</strong> theo đúng luật thi đấu quốc tế.
                  </p>
                </div>

                <div className="p-3.5 bg-neutral-950 rounded-2xl border border-neutral-800 flex flex-col gap-1.5">
                  <span className="font-semibold text-neutral-200">Session, Phạt +2 / DNF và Ghi chú:</span>
                  <p className="text-neutral-400 text-[11px]">
                    - Bạn có thể tạo nhiều <strong>Session</strong> riêng biệt cho từng loại Rubik (3x3, 2x2, 4x4, One-Handed...).<br />
                    - Ngay sau khi giải xong, bạn có thể bấm nút <strong>+2</strong> (nếu xoay thiếu 1 move cuối) hoặc <strong>DNF</strong> (chưa giải xong).<br />
                    - Bấm biểu tượng tin nhắn để lưu ghi chú (Comment) như: "Full step", "PLL Skip", "F2L mistake"...
                  </p>
                </div>

                <div className="p-3.5 bg-neutral-950 rounded-2xl border border-neutral-800 flex flex-col gap-1.5">
                  <span className="font-semibold text-neutral-200 flex items-center gap-1.5 text-rose-400">
                    <Heart className="w-3.5 h-3.5" />
                    Cá Nhân Hóa Ảnh Nền (Crush / Kỷ niệm):
                  </span>
                  <p className="text-neutral-400 text-[11px]">
                    Vào <strong>Settings &gt; Timer Background Photo</strong> hoặc bấm icon Trái tim để tải ảnh từ bộ sưu tập của bạn. Ảnh được lưu bảo mật trong trình duyệt (IndexedDB), có thể tùy chỉnh độ mờ (Blur), độ sáng (Brightness) và độ tối phủ nền để chữ số timer luôn rõ nét.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: CUBE 3D & SCRAMBLE */}
          {activeSection === 'cube3d' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-150">
              <h4 className="font-bold text-sm text-cyan-400 flex items-center gap-1.5">
                <Box className="w-4 h-4" />
                Mô Hình 3D & Sân Chơi Scramble (Scramble Playground)
              </h4>

              <div className="flex flex-col gap-3">
                <div className="p-3.5 bg-neutral-950 rounded-2xl border border-neutral-800 flex flex-col gap-1.5">
                  <span className="font-semibold text-neutral-200">Tương tác và Điều Khiển 3D:</span>
                  <ul className="list-disc list-inside text-neutral-400 space-y-1 text-[11px]">
                    <li><strong>Xoay góc nhìn:</strong> Nhấn giữ chuột trái hoặc vuốt ngón tay trên khối để quan sát 360 độ từ mọi góc. Xoay camera không làm thay đổi trạng thái khối.</li>
                    <li><strong>Điều khiển phát lại:</strong> Nút <strong>Play/Pause</strong> để xem thuật toán chạy tự động; nút <strong>Next/Prev</strong> để xem từng bước xoay; nút <strong>Jump to Start/End</strong> để nhảy nhanh về đầu hoặc cuối chuỗi.</li>
                    <li><strong>Tốc độ xem:</strong> Bấm nút tốc độ ($0.8x, 1.2x, 2.0x, 3.5x$) để tăng giảm tốc độ quay.</li>
                  </ul>
                </div>

                <div className="p-3.5 bg-neutral-950 rounded-2xl border border-neutral-800 flex flex-col gap-1.5">
                  <span className="font-semibold text-neutral-200">Bàn Phím Move Thủ Công (Manual Move Pad):</span>
                  <p className="text-neutral-400 text-[11px]">
                    Bấm vào icon <strong>Layers</strong> trên thanh công cụ 3D để mở bàn phím xoay thủ công. Bạn có thể nhấn trực tiếp các move:
                    <br />- <strong>Move 1 chiều:</strong> $R, L, U, D, F, B, M, E, S$
                    <br />- <strong>Move Prime (ngược chiều):</strong> $R', L', U', D', F', B'...$
                    <br />- <strong>Move 2 lần ($180^\circ$):</strong> $R2, L2, U2, D2, F2, B2, M2...$
                    <br />- <strong>Xoay cả khối:</strong> $x, y, z$
                  </p>
                </div>

                <div className="p-3.5 bg-neutral-950 rounded-2xl border border-neutral-800 flex flex-col gap-1.5">
                  <span className="font-semibold text-neutral-200">Scramble Chuẩn WCA & Quick Presets:</span>
                  <p className="text-neutral-400 text-[11px]">
                    - Bấm <strong>New Random Scramble</strong> để tạo scramble ngẫu nhiên 21 bước chuẩn WCA.<br />
                    - Mục <strong>Quick Presets</strong> cung cấp sẵn các mẫu kinh điển: <em>Checkerboard ($M2\ E2\ S2$), Superflip, T-Perm, H-Perm, Z-Perm, Sune, Six Spots...</em><br />
                    - Bạn có thể lưu scramble cá nhân (Save Scramble) hoặc dùng tính năng <strong>Bulk Import</strong> để dán danh sách scramble nhiều dòng từ csTimer hoặc bảng thi đấu WCA.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: DIAGRAMS OLL & PLL */}
          {activeSection === 'diagrams' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-150">
              <h4 className="font-bold text-sm text-amber-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                Cách Đọc Sơ Đồ Nhận Diện 2D (OLL & PLL Diagrams)
              </h4>

              <div className="p-3.5 bg-amber-950/30 rounded-2xl border border-amber-500/30 flex flex-col gap-1.5">
                <span className="font-semibold text-amber-300">Tại sao sơ đồ OLL và PLL lại hiển thị khác nhau?</span>
                <p className="text-neutral-300 text-[11px]">
                  Trong phương pháp <strong>CFOP</strong>, sau khi giải xong F2L (2 tầng đầu), bạn sẽ thực hiện 2 bước cuối:
                  <br /><strong>1. OLL (Orientation):</strong> Lật tất cả các viên tầng trên thành màu vàng (chưa quan tâm đúng vị trí).
                  <br /><strong>2. PLL (Permutation):</strong> Hoán vị các viên tầng trên về đúng vị trí (mặt trên ĐÃ VÀNG TOÀN BỘ).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* OLL Explanation */}
                <div className="p-3.5 bg-neutral-950 rounded-2xl border border-neutral-800 flex flex-col gap-2">
                  <span className="font-bold text-neutral-100 flex items-center gap-1.5 text-amber-400">
                    Cách Đọc Diagram OLL (57 Cases)
                  </span>
                  <p className="text-[11px] text-neutral-400">
                    - <strong>Lưới $3\times3$ ở giữa:</strong> Ô màu <strong>Vàng</strong> là viên đã được lật vàng lên trên; ô màu <strong>Xám tối</strong> là viên chưa được lật.
                    <br />- <strong>Vạch màu Vàng ở 4 cạnh bên:</strong> Báo hiệu vị trí sticker màu vàng đang nằm ở mặt bên (chĩa ra ngoài).
                    <br />- Nhận diện các mẫu OLL: <em>Dấu chấm (Dot), Đường thẳng (Line), Chữ L (Small L), Chữ thập (Cross), Con cá (Fish/Sune), Chữ T, Chữ W...</em>
                  </p>
                </div>

                {/* PLL Explanation */}
                <div className="p-3.5 bg-neutral-950 rounded-2xl border border-neutral-800 flex flex-col gap-2">
                  <span className="font-bold text-neutral-100 flex items-center gap-1.5 text-teal-400">
                    Cách Đọc Diagram PLL (21 Cases)
                  </span>
                  <p className="text-[11px] text-neutral-400">
                    - <strong>Mặt trên:</strong> Cả 9 ô đều là màu <strong>Vàng</strong> (vì OLL đã giải xong).
                    <br />- <strong>12 ô màu ở 4 cạnh bên:</strong> Hiển thị màu thực tế (Đỏ, Xanh lá, Xanh dương, Cam) ở trạng thái <strong>CHƯA GIẢI</strong> để bạn nhận diện:
                    <br />&nbsp;&nbsp;• <em>Headlights (Đèn pha):</em> 2 góc cùng màu kẹp viên cạnh khác màu (ví dụ: Cam - Đỏ - Cam).
                    <br />&nbsp;&nbsp;• <em>Bar (Thanh đã giải):</em> 3 ô cạnh nhau cùng màu (ví dụ: Cam - Cam - Cam).
                    <br />- <strong>Mũi tên màu Teal:</strong> Chỉ hướng hoán vị giữa các viên cần đổi chỗ để giải xong khối.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-neutral-950 rounded-2xl border border-neutral-800 flex flex-col gap-1.5">
                <span className="font-semibold text-neutral-200">Hiển thị khi CHƯA GIẢI (Unsolved State):</span>
                <p className="text-neutral-400 text-[11px]">
                  Tất cả các case trong thư viện (bao gồm cả case Community và My Cases) đều hiển thị ở <strong>trạng thái chưa giải</strong> — đây là tình huống thực tế bạn gặp trên khối Rubik trước khi áp dụng công thức. Bấm vào case để mở 3D và xem thuật toán từng bước giải quyết nó!
                </p>
              </div>
            </div>
          )}

          {/* SECTION 5: CFOP & TRAINER */}
          {activeSection === 'cfop' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-150">
              <h4 className="font-bold text-sm text-purple-400 flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                Luyện Tập Thuật Toán CFOP & Trainer (Drills)
              </h4>

              <div className="flex flex-col gap-3">
                <div className="p-3.5 bg-neutral-950 rounded-2xl border border-neutral-800 flex flex-col gap-1.5">
                  <span className="font-semibold text-neutral-200">Lộ Trình Học CFOP Khuyên Dùng:</span>
                  <ul className="list-disc list-inside text-neutral-400 space-y-1 text-[11px]">
                    <li><strong>Bước 1 - Cross (Dấu thập trắng):</strong> Giải dấu thập trắng ở mặt đáy trong dưới 8 bước.</li>
                    <li><strong>Bước 2 - F2L (First 2 Layers - 41 cases):</strong> Ghép cặp góc + cạnh và đưa vào slot mà không làm vỡ Cross.</li>
                    <li><strong>Bước 3 - 2-Look OLL & 2-Look PLL:</strong> Dành cho người mới học (chỉ cần thuộc khoảng 9 công thức cơ bản).</li>
                    <li><strong>Bước 4 - Full PLL (21 cases):</strong> Giúp giải tầng 3 trong 1 lần xoay duy nhất.</li>
                    <li><strong>Bước 5 - Full OLL (57 cases):</strong> Định hướng toàn bộ mặt vàng ngay sau khi xong F2L.</li>
                  </ul>
                </div>

                <div className="p-3.5 bg-neutral-950 rounded-2xl border border-neutral-800 flex flex-col gap-1.5">
                  <span className="font-semibold text-neutral-200">Chế Độ Luyện Tập Phản Xạ (Flashcard Drills):</span>
                  <p className="text-neutral-400 text-[11px]">
                    Vào tab <strong>Drills</strong>: Ứng dụng sẽ hiển thị ngẫu nhiên sơ đồ 2D của một case (công thức bị ẩn).
                    <br />1. Nhìn sơ đồ và đoán xem đây là case nào.
                    <br />2. Nhẩm công thức trong đầu hoặc thực hiện trên khối Rubik thật.
                    <br />3. Bấm <strong>Reveal Algorithm</strong> để kiểm tra xem bạn nhớ đúng không.
                    <br />4. Dùng bộ đếm giờ nhỏ ngay bên dưới để đo thời gian thực thi riêng cho case đó!
                  </p>
                </div>

                <div className="p-3.5 bg-neutral-950 rounded-2xl border border-neutral-800 flex flex-col gap-1.5">
                  <span className="font-semibold text-neutral-200">Đánh Dấu Tiến Độ Học Thuật Toán:</span>
                  <p className="text-neutral-400 text-[11px]">
                    Tại mỗi case trong thư viện, bạn có thể chọn trạng thái:
                    <br />- <strong className="text-neutral-400">Unlearned:</strong> Chưa học.
                    <br />- <strong className="text-amber-400">Learning:</strong> Đang luyện tập.
                    <br />- <strong className="text-emerald-400">Mastered:</strong> Đã thuộc làu và thực hiện trơn tru.
                    <br />Bộ lọc thư viện cho phép lọc xem những case nào bạn cần ôn tập lại.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: CUSTOM & COMMUNITY */}
          {activeSection === 'custom' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-150">
              <h4 className="font-bold text-sm text-rose-400 flex items-center gap-1.5">
                <Share2 className="w-4 h-4" />
                Tự Tạo Case Của Riêng Bạn & Thư Viện Cộng Đồng
              </h4>

              <div className="flex flex-col gap-3">
                <div className="p-3.5 bg-neutral-950 rounded-2xl border border-neutral-800 flex flex-col gap-1.5">
                  <span className="font-semibold text-neutral-200">Cách Tạo Custom Case Mới:</span>
                  <ol className="list-decimal list-inside text-neutral-400 space-y-1.5 text-[11px]">
                    <li>Tại tab <strong>Algorithms</strong>, bấm nút <strong>Create Case</strong> (biểu tượng dấu cộng).</li>
                    <li>Nhập tên case, chọn phân loại (OLL, PLL, F2L, hoặc Custom).</li>
                    <li>Nhập công thức giải (Algorithm) mà bạn yêu thích.</li>
                    <li>Hệ thống sẽ <strong>tự động tính toán Setup Scramble</strong> (chuỗi xáo ngược lại) để tạo trạng thái chưa giải chính xác.</li>
                    <li>Kiểm tra mô hình 3D và Diagram 2D xem trạng thái đã chuẩn ý bạn chưa, sau đó bấm <strong>Save Case</strong>.</li>
                  </ol>
                </div>

                <div className="p-3.5 bg-neutral-950 rounded-2xl border border-neutral-800 flex flex-col gap-1.5">
                  <span className="font-semibold text-neutral-200">Chia Sẻ & Copy từ Community:</span>
                  <p className="text-neutral-400 text-[11px]">
                    - Khi tạo case, nếu tích chọn <strong>Publish to Community</strong>, case sẽ được chia sẻ công khai cho mọi người cùng xem.<br />
                    - Khi duyệt các case hay trong tab <strong>Community</strong>, bạn có thể bấm <strong>Save to My Cases</strong> để tạo một bản sao độc lập vào bộ sưu tập cá nhân và chỉnh sửa tùy ý.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 7: NOTATION QUICK GUIDE */}
          {activeSection === 'notation' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-150">
              <h4 className="font-bold text-sm text-blue-400 flex items-center gap-1.5">
                <Compass className="w-4 h-4" />
                Bảng Ký Hiệu Xoay Khối Rubik (Rubik's Cube Notation)
              </h4>

              <p className="text-[11px] text-neutral-400">
                Ký hiệu WCA chuẩn quốc tế quy ước các mặt: <strong>R</strong> (Right - Phải), <strong>L</strong> (Left - Trái), <strong>U</strong> (Up - Trên), <strong>D</strong> (Down - Dưới), <strong>F</strong> (Front - Trước), <strong>B</strong> (Back - Sau).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 font-mono text-xs">
                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex flex-col gap-1">
                  <span className="font-bold text-teal-300">R / R' / R2</span>
                  <span className="text-[11px] text-neutral-400 font-sans">
                    Mặt Phải: $R$ (theo kim đồng hồ), $R'$ (ngược kim đồng hồ), $R2$ (quay $180^\circ$).
                  </span>
                </div>

                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex flex-col gap-1">
                  <span className="font-bold text-teal-300">L / L' / L2</span>
                  <span className="text-[11px] text-neutral-400 font-sans">
                    Mặt Trái: $L$ (theo kim đồng hồ), $L'$ (ngược kim đồng hồ), $L2$ (quay $180^\circ$).
                  </span>
                </div>

                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex flex-col gap-1">
                  <span className="font-bold text-teal-300">U / U' / U2</span>
                  <span className="text-[11px] text-neutral-400 font-sans">
                    Mặt Trên: $U$ (theo kim đồng hồ), $U'$ (ngược kim đồng hồ), $U2$ (quay $180^\circ$).
                  </span>
                </div>

                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex flex-col gap-1">
                  <span className="font-bold text-teal-300">D / D' / D2</span>
                  <span className="text-[11px] text-neutral-400 font-sans">
                    Mặt Đáy: $D$ (theo kim đồng hồ), $D'$ (ngược kim đồng hồ), $D2$ (quay $180^\circ$).
                  </span>
                </div>

                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex flex-col gap-1">
                  <span className="font-bold text-teal-300">F / F' / F2</span>
                  <span className="text-[11px] text-neutral-400 font-sans">
                    Mặt Trước: $F$ (theo kim đồng hồ), $F'$ (ngược kim đồng hồ), $F2$ (quay $180^\circ$).
                  </span>
                </div>

                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex flex-col gap-1">
                  <span className="font-bold text-teal-300">B / B' / B2</span>
                  <span className="text-[11px] text-neutral-400 font-sans">
                    Mặt Sau: $B$ (theo kim đồng hồ), $B'$ (ngược kim đồng hồ), $B2$ (quay $180^\circ$).
                  </span>
                </div>

                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex flex-col gap-1">
                  <span className="font-bold text-amber-300">M / M' / M2</span>
                  <span className="text-[11px] text-neutral-400 font-sans">
                    Lớp giữa dọc (giữa L và R): Quay theo hướng của $L$.
                  </span>
                </div>

                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex flex-col gap-1">
                  <span className="font-bold text-amber-300">E / E' / E2</span>
                  <span className="text-[11px] text-neutral-400 font-sans">
                    Lớp giữa ngang (giữa U và D): Quay theo hướng của $D$.
                  </span>
                </div>

                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex flex-col gap-1">
                  <span className="font-bold text-amber-300">S / S' / S2</span>
                  <span className="text-[11px] text-neutral-400 font-sans">
                    Lớp giữa đứng (giữa F và B): Quay theo hướng của $F$.
                  </span>
                </div>

                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex flex-col gap-1">
                  <span className="font-bold text-indigo-300">Rw / Lw / Uw...</span>
                  <span className="text-[11px] text-neutral-400 font-sans">
                    Wide Moves: Xoay đồng thời 2 lớp (ví dụ $Rw$ = xoay cả mặt R và lớp giữa M).
                  </span>
                </div>

                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex flex-col gap-1">
                  <span className="font-bold text-indigo-300">x / y / z</span>
                  <span className="text-[11px] text-neutral-400 font-sans">
                    Cube Rotations: Xoay toàn bộ khối theo trục của $R$ ($x$), $U$ ($y$), hoặc $F$ ($z$).
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-neutral-800 pt-3 shrink-0">
          <span className="text-[11px] text-neutral-500 font-mono hidden sm:inline">
            HungCube PRO · Speedcubing Architecture
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs bg-teal-600 hover:bg-teal-500 text-white font-semibold transition-colors ml-auto shadow-sm"
          >
            Đã hiểu, bắt đầu giải!
          </button>
        </div>
      </div>
    </div>
  );
};
