import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, CreditCard, Receipt, FileText, Plus, X, Printer, CheckCircle2, UserPlus, DollarSign } from 'lucide-react';
import gsap from 'gsap';
import api from '../../shared/api';

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  courses: number;
  joined: string;
}

interface Course {
  id: string;
  name: string;
  schedule: string;
  days: string[];
  startTime: string;
  endTime: string;
  classroom: string;
  cost: number;
  teacher: string;
  capacity: number;
  enrolled: number;
  status: string;
}

interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  courseName: string;
  classroom: string;
  schedule: string;
  cost: number;
  amountPaid: number;
  balance: number;
  date: string;
}

interface ReceiptItem {
  id: string;
  receiptNo: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  courseName: string;
  totalCost: number;
  amountPaid: number;
  balance: number;
  date: string;
  method: string;
}

function numeroALetras(num: number): string {
  const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const especiales = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
  const decenas2 = ['VEINTE', 'VEINTIUNO', 'VEINTIDOS', 'VEINTITRES', 'VEINTICUATRO', 'VEINTICINCO', 'VEINTISEIS', 'VEINTISIETE', 'VEINTIOCHO', 'VEINTINUEVE'];
  const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

  if (num === 0) return 'CERO 00/100 BOLIVIANOS';
  if (num === 100) return 'SON: CIEN 00/100 BOLIVIANOS';

  const convertGroup = (n: number): string => {
    let output = '';
    const c = Math.floor(n / 100);
    const d = Math.floor((n % 100) / 10);
    const u = n % 10;

    if (c > 0) output += centenas[c] + ' ';
    if (d > 0) {
      if (d === 1) {
        output += especiales[u] + ' ';
        return output;
      } else if (d === 2 && u > 0) {
        output += decenas2[u] + ' ';
        return output;
      } else {
        output += decenas[d] + ' ';
        if (u > 0) output += 'Y ';
      }
    }
    if (u > 0 && d !== 1) {
      output += unidades[u] + ' ';
    }
    return output;
  };

  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);
  const centavos = (decimalPart < 10 ? '0' : '') + decimalPart + '/100 BOLIVIANOS';

  if (integerPart === 0) return `SON: CERO Y ${centavos}`;

  let texto = '';
  const millones = Math.floor(integerPart / 1000000);
  const miles = Math.floor((integerPart % 1000000) / 1000);
  const unidadesRestantes = integerPart % 1000;

  if (millones > 0) {
    if (millones === 1) texto += 'UN MILLON ';
    else texto += convertGroup(millones) + 'MILLONES ';
  }
  if (miles > 0) {
    if (miles === 1) texto += 'MIL ';
    else texto += convertGroup(miles) + 'MIL ';
  }
  if (unidadesRestantes > 0) {
    texto += convertGroup(unidadesRestantes);
  }

  return `SON: ${texto.trim()} ${centavos}`;
}

const openInvoicePrintTab = (receipt: any, profile: any) => {
  const newWindow = window.open('', '_blank');
  if (!newWindow) {
    alert('Por favor, permite las ventanas emergentes (pop-ups) para ver la factura.');
    return;
  }
  
  const tenantName = profile?.tenant?.name || 'Instituto de Idiomas Oxford';
  
  const htmlContent = `
    <html>
      <head>
        <title>Factura / Recibo - ${receipt.receiptNo}</title>
        <style>
          @page { size: letter; margin: 10mm; }
          body {
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #1f2937;
            margin: 0;
            padding: 20px;
            background-color: #fff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .invoice-box {
            max-width: 800px;
            margin: auto;
            border: 1px solid #e5e7eb;
            padding: 40px;
            border-radius: 16px;
            background: #ffffff;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #6366f1;
            padding-bottom: 24px;
            margin-bottom: 24px;
          }
          .header-left h1 {
            margin: 0;
            font-size: 26px;
            font-weight: 800;
            color: #111827;
            letter-spacing: -0.025em;
          }
          .header-left p {
            margin: 4px 0 0 0;
            font-size: 13px;
            color: #4b5563;
          }
          .header-right {
            text-align: right;
          }
          .header-right h2 {
            margin: 0;
            font-size: 22px;
            font-weight: 800;
            color: #6366f1;
            letter-spacing: 0.05em;
          }
          .header-right p {
            margin: 4px 0 0 0;
            font-size: 13px;
            color: #4b5563;
          }
          .info-grid {
            display: grid;
            grid-template-cols: 1fr 1fr;
            gap: 24px;
            margin-bottom: 32px;
          }
          .info-card {
            background: #f9fafb;
            padding: 20px;
            border-radius: 12px;
            border: 1px solid #f3f4f6;
          }
          .info-card h3 {
            margin: 0 0 8px 0;
            font-size: 10px;
            font-weight: 700;
            color: #9ca3af;
            text-transform: uppercase;
            letter-spacing: 0.1em;
          }
          .info-card p {
            margin: 0;
            font-size: 15px;
            font-weight: 700;
            color: #111827;
          }
          .info-card span {
            display: block;
            margin-top: 4px;
            font-size: 13px;
            color: #6b7280;
          }
          .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
          }
          .details-table th {
            background: #f9fafb;
            padding: 12px 16px;
            text-align: left;
            font-size: 12px;
            font-weight: 700;
            color: #4b5563;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-bottom: 2px solid #e5e7eb;
          }
          .details-table td {
            padding: 16px;
            font-size: 14px;
            color: #374151;
            border-bottom: 1px solid #e5e7eb;
          }
          .totals-section {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 32px;
          }
          .totals-box {
            width: 280px;
            background: #f9fafb;
            padding: 20px;
            border-radius: 12px;
            border: 1px solid #f3f4f6;
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            margin-bottom: 10px;
            color: #4b5563;
          }
          .totals-row:last-child {
            margin-bottom: 0;
            font-weight: 700;
            color: #111827;
            border-top: 1px solid #e5e7eb;
            padding-top: 10px;
          }
          .totals-row.highlight {
            color: #10b981;
            font-weight: 700;
          }
          .totals-row.alert {
            color: #ef4444;
            font-weight: 700;
          }
          .amount-words {
            font-size: 12px;
            font-style: italic;
            color: #6b7280;
            margin-bottom: 32px;
            border-left: 4px solid #6366f1;
            padding-left: 12px;
            line-height: 1.5;
          }
          .footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid #e5e7eb;
            padding-top: 24px;
            margin-top: 24px;
          }
          .footer-qr {
            display: flex;
            align-items: center;
            gap: 16px;
          }
          .footer-qr img {
            width: 80px;
            height: 80px;
            border: 1px solid #e5e7eb;
            padding: 4px;
            border-radius: 8px;
            background: white;
          }
          .footer-qr-text h4 {
            margin: 0;
            font-size: 12px;
            font-weight: 700;
            color: #374151;
          }
          .footer-qr-text p {
            margin: 4px 0 0 0;
            font-size: 10px;
            color: #6b7280;
            max-width: 380px;
            line-height: 1.4;
          }
          .footer-signature-container {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .footer-signature {
            text-align: center;
            width: 200px;
            border-top: 1px dashed #9ca3af;
            padding-top: 8px;
            font-size: 11px;
            font-weight: 700;
            color: #4b5563;
          }
          .print-btn-container {
            text-align: center;
            margin-top: 30px;
          }
          .print-btn {
            background-color: #6366f1;
            color: white;
            border: none;
            padding: 12px 24px;
            font-size: 14px;
            font-weight: 700;
            border-radius: 8px;
            cursor: pointer;
            box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.2);
            transition: background-color 0.2s, transform 0.1s;
          }
          .print-btn:hover {
            background-color: #4f46e5;
          }
          .print-btn:active {
            transform: scale(0.98);
          }
          @media print {
            .print-btn-container {
              display: none;
            }
            body {
              padding: 0;
              background: white;
            }
            .invoice-box {
              border: none;
              box-shadow: none;
              padding: 0;
              max-width: 100%;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="header">
            <div class="header-left">
              <h1>${tenantName}</h1>
              <p>Sede Principal - Bolivia</p>
              <p>Telf: 789-45612 | NIT: 3029482029</p>
            </div>
            <div class="header-right">
              <h2>FACTURA</h2>
              <p><strong>Nº FACTURA:</strong> ${receipt.receiptNo}</p>
              <p><strong>Nº AUTORIZACIÓN:</strong> 2904001928374</p>
              <p><strong>FECHA:</strong> ${receipt.date}</p>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-card">
              <h3>Datos del Estudiante</h3>
              <p>${receipt.studentName}</p>
              <span>Teléfono: ${receipt.studentPhone}</span>
            </div>
            <div class="info-card">
              <h3>Detalles del Pago</h3>
              <p>Método: ${receipt.method}</p>
              <span>Estado: ${receipt.balance === 0 ? 'PAGADO TOTAL' : 'PAGADO PARCIAL'}</span>
            </div>
          </div>

          <table class="details-table">
            <thead>
              <tr>
                <th>Concepto / Descripción</th>
                <th style="text-align: right">Total (Bs.)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Inscripción a Curso: ${receipt.courseName}</strong><br/>
                  <span style="font-size: 12px; color: #6b7280; display: inline-block; margin-top: 4px;">
                    Matrícula académica correspondiente al curso asignado.
                  </span>
                </td>
                <td style="text-align: right; font-weight: 700;">Bs. ${receipt.totalCost}</td>
              </tr>
            </tbody>
          </table>

          <div class="amount-words">
            ${numeroALetras(receipt.amountPaid)}
          </div>

          <div class="totals-section">
            <div class="totals-box">
              <div class="totals-row">
                <span>Costo Total del Curso:</span>
                <span>Bs. ${receipt.totalCost}</span>
              </div>
              <div class="totals-row highlight">
                <span>Monto Abonado:</span>
                <span>Bs. ${receipt.amountPaid}</span>
              </div>
              <div class="totals-row ${receipt.balance > 0 ? 'alert' : ''}">
                <span>Saldo Pendiente:</span>
                <span>Bs. ${receipt.balance}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <div class="footer-qr">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=NIT:3029482029|Factura:${receipt.receiptNo}|Total:${receipt.amountPaid}|Fecha:${receipt.date.split(' ')[0]}" alt="QR Factura"/>
              <div class="footer-qr-text">
                <h4>DOCUMENTO VÁLIDO PARA EFECTO TRIBUTARIO</h4>
                <p>"ESTA FACTURA CONTRIBUYE AL DESARROLLO DEL PAÍS, EL USO ILÍCITO DE ÉSTA SERÁ SANCIONADO DE ACUERDO A LEY DE BOLIVIA"</p>
              </div>
            </div>
            <div class="footer-signature-container">
              <div style="height: 40px;"></div>
              <div class="footer-signature">
                Firma Secretaria / Caja
              </div>
            </div>
          </div>
        </div>

        <div class="print-btn-container">
          <button class="print-btn" onclick="window.print()">Imprimir Factura / Recibo</button>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          }
        </script>
      </body>
    </html>
  `;

  newWindow.document.write(htmlContent);
  newWindow.document.close();
};

export default function Payments() {
  const { profile } = useOutletContext<{ profile: any }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const tenantSlug = profile?.tenant?.slug || 'oxford';
  const activeBranch = localStorage.getItem(`${tenantSlug}_academy_active_branch`) || 'principal';

  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [receipts, setReceipts] = useState<ReceiptItem[]>([]);

  const fetchStudents = async () => {
    try {
      const res = await api.get(`/students?branchId=${activeBranch}`);
      const mapped = res.data.map((s: any) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        phone: s.phone,
        status: s.status === 'ACTIVE' ? 'Activo' : s.status === 'INACTIVE' ? 'Inactivo' : 'Pendiente',
        courses: s.enrollments?.length || 0,
        joined: s.createdAt ? new Date(s.createdAt).toISOString().split('T')[0] : '',
      }));
      setStudents(mapped);
      if (mapped.length > 0 && !selectedStudentId) {
        setSelectedStudentId(mapped[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get(`/courses?branchId=${activeBranch}`);
      const mapped = res.data.map((c: any) => {
        const days = c.schedules?.map((s: any) => s.dayOfWeek) || [];
        const startTime = c.schedules?.[0]?.startTime || '15:00';
        const endTime = c.schedules?.[0]?.endTime || '16:30';
        const classroomName = c.schedules?.[0]?.classroom?.name || '';
        const daysStr = days.join('-');
        const scheduleStr = `${daysStr} ${startTime} - ${endTime}`;

        return {
          id: c.id,
          name: c.name,
          cost: c.price,
          teacher: c.teacher,
          capacity: c.capacity,
          enrolled: c.enrollments?.length || 0,
          status: c.status === 'ACTIVE' ? 'Activo' : c.status === 'FULL' ? 'Lleno' : 'Inactivo',
          days,
          startTime,
          endTime,
          classroom: classroomName,
          schedule: scheduleStr,
        };
      });
      setCourses(mapped);
      if (mapped.length > 0) {
        setSelectedCourseId(mapped[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchEnrollmentsAndPayments = async () => {
    try {
      const enrollsRes = await api.get(`/enrollments?branchId=${activeBranch}`);
      const mappedEnrolls = enrollsRes.data.map((e: any) => {
        const totalPaid = e.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
        const balance = Math.max((e.course?.price || 0) - totalPaid, 0);

        return {
          id: e.id,
          studentId: e.studentId,
          courseId: e.courseId,
          courseName: e.course?.name || '',
          classroom: e.course?.schedules?.[0]?.classroom?.name || '',
          schedule: (e.course?.schedules?.map((s: any) => s.dayOfWeek) || []).join('-') + ` ${e.course?.schedules?.[0]?.startTime || ''} - ${e.course?.schedules?.[0]?.endTime || ''}`,
          cost: e.course?.price || 0,
          amountPaid: totalPaid,
          balance,
          date: e.createdAt ? new Date(e.createdAt).toISOString().split('T')[0] : '',
        };
      });
      setEnrollments(mappedEnrolls);

      const paymentsRes = await api.get(`/payments?branchId=${activeBranch}`);
      const mappedPayments = paymentsRes.data.map((p: any) => {
        const enrollmentObj = p.enrollment || {};
        const totalPaid = enrollmentObj.payments?.reduce((sum: number, pay: any) => sum + pay.amount, 0) || 0;
        const balance = Math.max((enrollmentObj.course?.price || 0) - totalPaid, 0);

        return {
          id: p.id,
          receiptNo: p.invoiceNumber,
          studentId: enrollmentObj.studentId || '',
          studentName: enrollmentObj.student?.name || '',
          studentPhone: enrollmentObj.student?.phone || '',
          courseName: enrollmentObj.course?.name || '',
          totalCost: enrollmentObj.course?.price || 0,
          amountPaid: p.amount,
          balance,
          date: p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] + ' ' + new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          method: p.paymentMethod === 'CASH' ? 'Efectivo' : p.paymentMethod === 'QR' ? 'QR' : 'Transferencia',
        };
      });
      setReceipts(mappedPayments);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchCourses();
    fetchEnrollmentsAndPayments();
  }, [activeBranch]);

  // Modal States
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);

  // Active Receipt for Viewer
  const [activeReceipt, setActiveReceipt] = useState<ReceiptItem | null>(null);

  // Collect balance state
  const [collectEnrollment, setCollectEnrollment] = useState<Enrollment | null>(null);
  const [collectAmount, setCollectAmount] = useState('');
  const [collectMethod, setCollectMethod] = useState('Efectivo');

  // Enrollment Form State
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');

  // Student Form State
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');

  useEffect(() => {
    gsap.fromTo(
      '.gsap-payment-item',
      { opacity: 0, x: -10 },
      { opacity: 1, x: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' }
    );
  }, [selectedStudentId]);

  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const studentEnrollments = enrollments.filter(e => e.studentId === selectedStudentId);
  const totalStudentBalance = studentEnrollments.reduce((acc, curr) => acc + curr.balance, 0);

  const handleOpenEnroll = () => {
    if (courses.length === 0) {
      alert('Primero debes crear cursos en el Catálogo de Cursos.');
      return;
    }
    setSelectedCourseId(courses[0].id);
    setPaymentAmount(courses[0].cost.toString());
    setPaymentMethod('Efectivo');
    setIsEnrollModalOpen(true);
  };

  const handleCourseChange = (id: string) => {
    setSelectedCourseId(id);
    const course = courses.find(c => c.id === id);
    if (course) {
      setPaymentAmount(course.cost.toString());
    }
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedCourseId) return;

    const student = students.find(s => s.id === selectedStudentId);
    const course = courses.find(c => c.id === selectedCourseId);

    if (!student || !course) return;

    // Check if student is already enrolled in this course
    const isEnrolled = enrollments.some(en => en.studentId === selectedStudentId && en.courseId === selectedCourseId);
    if (isEnrolled) {
      alert('El estudiante ya está inscrito en este curso.');
      return;
    }

    // Check capacity
    if (course.enrolled >= course.capacity) {
      alert('No hay cupos disponibles para este curso.');
      return;
    }

    const payAmt = Number(paymentAmount);
    if (payAmt < 0 || payAmt > course.cost) {
      alert(`El pago debe estar entre 0 y Bs. ${course.cost}`);
      return;
    }

    try {
      // 1. Registrar inscripción
      const enrollmentRes = await api.post('/enrollments', {
        studentId: selectedStudentId,
        courseId: selectedCourseId,
      });

      let newReceipt = null;

      // 2. Si se hizo un pago inicial, registrar el recibo
      if (payAmt > 0) {
        const invoiceNumber = `FAC-000${Math.floor(100 + Math.random() * 900)}`;
        const paymentRes = await api.post('/payments', {
          enrollmentId: enrollmentRes.data.id,
          amount: payAmt,
          paymentMethod: paymentMethod === 'Efectivo' ? 'CASH' : paymentMethod === 'QR' ? 'QR' : 'TRANSFER',
          invoiceNumber,
        });

        // Map backend created payment to UI ReceiptItem
        const p = paymentRes.data;
        newReceipt = {
          id: p.id,
          receiptNo: p.invoiceNumber,
          studentId: student.id,
          studentName: student.name,
          studentPhone: student.phone,
          courseName: course.name,
          totalCost: course.cost,
          amountPaid: p.amount,
          balance: course.cost - p.amount,
          date: new Date().toLocaleDateString('es-BO') + ' ' + new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }),
          method: paymentMethod,
        };
      }

      setIsEnrollModalOpen(false);
      setPaymentAmount('');
      await fetchEnrollmentsAndPayments();

      if (newReceipt) {
        setActiveReceipt(newReceipt);
        setIsReceiptModalOpen(true);
        setTimeout(() => {
          openInvoicePrintTab(newReceipt, profile);
        }, 100);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al inscribir al estudiante');
    }
  };

  const handleOpenCollect = (enroll: Enrollment) => {
    setCollectEnrollment(enroll);
    setCollectAmount(enroll.balance.toString());
    setCollectMethod('Efectivo');
    setIsCollectModalOpen(true);
  };

  const handleCollectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectEnrollment || !selectedStudent) return;

    const payAmt = Number(collectAmount);
    if (payAmt <= 0 || payAmt > collectEnrollment.balance) {
      alert(`El monto de pago debe ser mayor a 0 y menor o igual al saldo deudor (Bs. ${collectEnrollment.balance})`);
      return;
    }

    try {
      const invoiceNumber = `FAC-000${Math.floor(100 + Math.random() * 900)}`;
      const paymentRes = await api.post('/payments', {
        enrollmentId: collectEnrollment.id,
        amount: payAmt,
        paymentMethod: collectMethod === 'Efectivo' ? 'CASH' : collectMethod === 'QR' ? 'QR' : 'TRANSFER',
        invoiceNumber,
      });

      const p = paymentRes.data;
      const newReceipt = {
        id: p.id,
        receiptNo: p.invoiceNumber,
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        studentPhone: selectedStudent.phone,
        courseName: collectEnrollment.courseName,
        totalCost: collectEnrollment.cost,
        amountPaid: p.amount,
        balance: collectEnrollment.balance - p.amount,
        date: new Date().toLocaleDateString('es-BO') + ' ' + new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }),
        method: collectMethod,
      };

      setIsCollectModalOpen(false);
      setCollectAmount('');
      await fetchEnrollmentsAndPayments();

      setActiveReceipt(newReceipt);
      setIsReceiptModalOpen(true);
      setTimeout(() => {
        openInvoicePrintTab(newReceipt, profile);
      }, 100);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al registrar el pago');
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/students', {
        name: newStudentName,
        email: newStudentEmail,
        phone: newStudentPhone,
        branchId: activeBranch,
      });
      setIsStudentModalOpen(false);
      await fetchStudents();
      setSelectedStudentId(res.data.id);
      setNewStudentName('');
      setNewStudentEmail('');
      setNewStudentPhone('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al crear el estudiante');
    }
  };

  const handlePrint = () => {
    if (activeReceipt) {
      openInvoicePrintTab(activeReceipt, profile);
    } else {
      window.print();
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.phone.includes(searchTerm)
  );

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Estilos embebidos auto-contenidos para impresión del recibo */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-receipt-modal, .printable-receipt-modal * {
            visibility: visible;
          }
          .printable-receipt-modal {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
            padding: 20px;
          }
          .printable-receipt-modal button {
            display: none !important;
          }
          .printable-receipt-modal .text-white {
            color: black !important;
          }
          .printable-receipt-modal .text-gray-400 {
            color: #4b5563 !important;
          }
          .printable-receipt-modal .border-gray-800 {
            border-color: #cbd5e1 !important;
          }
          .printable-receipt-modal .bg-gray-900 {
            background-color: #f1f5f9 !important;
          }
        }
      `}</style>

      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-indigo-400" />
            Inscripciones y Cobros por Curso
          </h2>
          <p className="text-sm text-gray-400 mt-1">Registra inscripciones a cursos individuales, emite facturas/recibos y controla los cobros.</p>
        </div>
        
        <button
          onClick={() => setIsStudentModalOpen(true)}
          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20 cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          Registrar Estudiante Rápido
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Buscador de Estudiantes */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="glass-panel rounded-3xl p-6">
            <h3 className="text-xs font-bold text-gray-200 mb-4 uppercase tracking-wider">Buscar Estudiante</h3>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Nombre o Teléfono..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 select-none">
              {filteredStudents.map((student) => (
                <div 
                  key={student.id}
                  onClick={() => setSelectedStudentId(student.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedStudentId === student.id 
                      ? 'bg-indigo-500/20 border-indigo-500/40 shadow-inner' 
                      : 'bg-gray-900/40 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <p className="font-bold text-gray-200 text-sm">{student.name}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-[10px] text-gray-500">{student.phone}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-gray-900 text-gray-400 border border-gray-800 font-semibold">{student.courses} Cursos</span>
                  </div>
                </div>
              ))}
              {filteredStudents.length === 0 && (
                <div className="text-center py-6 text-gray-500 text-sm">No se encontraron estudiantes.</div>
              )}
            </div>
          </div>
        </div>

        {/* Estado de Cuenta */}
        <div className="lg:col-span-2">
          {selectedStudent ? (
            <div className="glass-panel rounded-3xl p-6 h-full flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-800">
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedStudent.name}</h3>
                    <p className="text-xs text-indigo-400 mt-1">{selectedStudent.email} • Tel: {selectedStudent.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Deuda Pendiente</p>
                    <p className={`text-2xl font-bold ${totalStudentBalance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      Bs. {totalStudentBalance}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider">Cursos Inscritos</h4>
                  <button
                    onClick={handleOpenEnroll}
                    className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/25 border border-indigo-500/20 hover:border-indigo-500/40 text-indigo-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Inscribir a Curso
                  </button>
                </div>
                
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {studentEnrollments.map((enroll) => (
                    <div key={enroll.id} className="gsap-payment-item p-4 rounded-2xl bg-gray-900/60 border border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <p className="font-bold text-gray-200">{enroll.courseName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Aula: {enroll.classroom || 'Sin Aula'} | Horario: {enroll.schedule}</p>
                        <div className="flex gap-4 mt-2">
                          <span className="text-[10px] text-gray-400">Costo: Bs. {enroll.cost}</span>
                          <span className="text-[10px] text-emerald-400 font-semibold">Abonado: Bs. {enroll.amountPaid}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="text-left sm:text-right flex-1">
                          <p className={`font-bold ${enroll.balance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            Bs. {enroll.balance}
                          </p>
                          <p className={`text-[9px] uppercase font-bold tracking-wider mt-0.5 ${
                            enroll.balance > 0 ? 'text-rose-400' : 'text-emerald-400'
                          }`}>
                            {enroll.balance > 0 ? 'Con Saldo' : 'Cancelado'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {enroll.balance > 0 && (
                            <button 
                              onClick={() => handleOpenCollect(enroll)}
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all active:scale-95 whitespace-nowrap cursor-pointer flex items-center gap-1 shadow-md shadow-emerald-500/10"
                            >
                              <DollarSign className="h-3 w-3" /> Cobrar
                            </button>
                          )}
                          <button
                            onClick={() => {
                              const r = receipts.find(rc => rc.studentId === selectedStudent.id && rc.courseName === enroll.courseName);
                              if (r) {
                                setActiveReceipt(r);
                                setIsReceiptModalOpen(true);
                              } else {
                                alert('No se encontró un recibo emitido para esta inscripción.');
                              }
                            }}
                            className="px-3 py-1.5 bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                          >
                            Recibo
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {studentEnrollments.length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      Este estudiante no está inscrito en ningún curso.
                    </div>
                  )}
                </div>
              </div>

              {/* Historial Recibos */}
              <div className="mt-6 pt-6 border-t border-gray-800">
                <h4 className="text-xs font-bold text-gray-200 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <Receipt className="h-4.5 w-4.5 text-indigo-400" />
                  Últimos Recibos Emitidos
                </h4>
                <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto pr-1">
                  {receipts
                    .filter(r => r.studentId === selectedStudent.id)
                    .map(r => (
                      <button
                        key={r.id}
                        onClick={() => {
                          setActiveReceipt(r);
                          setIsReceiptModalOpen(true);
                        }}
                        className="px-3 py-2 bg-gray-900/60 hover:bg-gray-900 hover:border-gray-700 border border-gray-850 rounded-xl text-left transition-all cursor-pointer flex items-center gap-2.5"
                      >
                        <FileText className="h-3.5 w-3.5 text-gray-500" />
                        <div>
                          <p className="text-[10px] font-bold text-gray-200">{r.receiptNo}</p>
                          <p className="text-[8px] text-gray-500 leading-none mt-0.5">{r.date.split(' ')[0]} • Bs. {r.amountPaid}</p>
                        </div>
                      </button>
                    ))}
                  {receipts.filter(r => r.studentId === selectedStudent.id).length === 0 && (
                    <span className="text-[10px] text-gray-500">Ningún recibo emitido aún.</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-6 h-full flex flex-col items-center justify-center text-center min-h-[400px]">
              <div className="p-4 rounded-full bg-gray-900/50 mb-4 border border-gray-800">
                <Search className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-300 mb-2">Ningún estudiante seleccionado</h3>
              <p className="text-sm text-gray-500 max-w-sm">
                Busca y selecciona un estudiante en la lista lateral para ver sus inscripciones, cobros y recibos.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal - Inscribir Curso */}
      {isEnrollModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 relative">
            <button 
              onClick={() => setIsEnrollModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-xl font-bold text-white mb-6">Inscribir Alumno a Curso</h3>

            <form onSubmit={handleEnrollSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1.5">Estudiante</label>
                <input 
                  type="text" 
                  disabled
                  value={selectedStudent.name}
                  className="w-full px-4 py-2.5 bg-gray-900/80 border border-gray-850 rounded-xl text-sm text-gray-300"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1.5">Seleccionar Curso</label>
                <select 
                  value={selectedCourseId || ''}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-850 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50 cursor-pointer"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id} className="bg-gray-900 text-white">
                      {c.name} (Bs. {c.cost}) - Cupos: {c.capacity - c.enrolled}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1.5">Monto de Pago (Bs.)</label>
                  <input 
                    type="number" 
                    required
                    min={0}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-850 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50"
                  />
                  <span className="text-[10px] text-gray-500 mt-1 block">Puede ser parcial.</span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1.5">Método de Pago</label>
                  <select 
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-850 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50 cursor-pointer"
                  >
                    <option value="Efectivo" className="bg-gray-900 text-white">Efectivo</option>
                    <option value="QR" className="bg-gray-900 text-white">QR Bancario</option>
                    <option value="Transferencia" className="bg-gray-900 text-white">Transferencia</option>
                    <option value="Tarjeta" className="bg-gray-900 text-white">Tarjeta</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-800 hover:bg-gray-800 text-gray-400 hover:text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-colors cursor-pointer"
                >
                  Inscribir y Cobrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Registrar Alumno Rápido */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 relative">
            <button 
              onClick={() => setIsStudentModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-xl font-bold text-white mb-6">Registrar Estudiante Rápido</h3>

            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1.5">Nombre Completo</label>
                <input 
                  type="text" 
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value.toUpperCase())}
                  placeholder="Ej. Carlos Silva"
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-850 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1.5">Correo Electrónico</label>
                <input 
                  type="email" 
                  required
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value.toLowerCase())}
                  placeholder="ejemplo@email.com"
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-850 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1.5">Teléfono / Celular</label>
                <input 
                  type="text" 
                  required
                  value={newStudentPhone}
                  onChange={(e) => setNewStudentPhone(e.target.value)}
                  placeholder="Ej. 78945612"
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-850 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-800 hover:bg-gray-800 text-gray-400 hover:text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-colors cursor-pointer"
                >
                  Guardar Estudiante
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Cobrar Saldo Deudor */}
      {isCollectModalOpen && collectEnrollment && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 relative">
            <button 
              onClick={() => setIsCollectModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-xl font-bold text-white mb-6">Cobrar Saldo Pendiente</h3>

            <form onSubmit={handleCollectSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1.5">Curso</label>
                <input 
                  type="text" 
                  disabled
                  value={collectEnrollment.courseName}
                  className="w-full px-4 py-2.5 bg-gray-900/80 border border-gray-850 rounded-xl text-sm text-gray-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1.5">Saldo Deudor (Bs.)</label>
                  <input 
                    type="text" 
                    disabled
                    value={collectEnrollment.balance}
                    className="w-full px-4 py-2.5 bg-gray-900/80 border border-gray-850 rounded-xl text-sm text-rose-400 font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-400 block mb-1.5">Abonar Monto (Bs.)</label>
                  <input 
                    type="number" 
                    required
                    min={1}
                    max={collectEnrollment.balance}
                    value={collectAmount}
                    onChange={(e) => setCollectAmount(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-850 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1.5">Método de Cobro</label>
                <select 
                  value={collectMethod}
                  onChange={(e) => setCollectMethod(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-850 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50 cursor-pointer"
                >
                  <option value="Efectivo" className="bg-gray-900 text-white">Efectivo</option>
                  <option value="QR" className="bg-gray-900 text-white">QR Bancario</option>
                  <option value="Transferencia" className="bg-gray-900 text-white">Transferencia</option>
                  <option value="Tarjeta" className="bg-gray-900 text-white">Tarjeta</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsCollectModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-800 hover:bg-gray-800 text-gray-400 hover:text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/20 transition-colors cursor-pointer"
                >
                  Cobrar y Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Visor de Recibo Premium e Imprimible */}
      {isReceiptModalOpen && activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="printable-receipt-modal glass-panel w-full max-w-xl rounded-3xl p-8 border border-gray-800 relative bg-gray-950 shadow-2xl my-8">
            {/* Header Controls */}
            <div className="absolute right-4 top-4 flex gap-2 printable-exclude z-20">
              <button 
                onClick={handlePrint}
                className="p-2 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-indigo-400 hover:text-indigo-300 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              >
                <Printer className="h-4.5 w-4.5" />
                Imprimir
              </button>
              <button 
                onClick={() => setIsReceiptModalOpen(false)}
                className="p-2 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Receipt Body */}
            <div className="space-y-6 pt-4 text-left">
              {/* Receipt Header */}
              <div className="flex justify-between items-start border-b border-gray-800 pb-6">
                <div>
                  <h3 className="text-xl font-extrabold bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                    {profile?.tenant?.name || 'Instituto Oxford'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Sede Principal - Bolivia</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Telf: 789-45612 | NIT: 3029482029</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold tracking-wider text-indigo-400 uppercase bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full">
                    Recibo Oficial
                  </span>
                  <h4 className="text-md font-bold text-gray-200 mt-3">{activeReceipt.receiptNo}</h4>
                  <p className="text-[9px] text-gray-500 mt-0.5">{activeReceipt.date}</p>
                </div>
              </div>

              {/* Receipt Success confirmation message */}
              <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold printable-exclude">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <span>¡Cobro registrado con éxito en Caja Diaria!</span>
              </div>

              {/* Student Details */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-gray-900/40 border border-gray-900 rounded-2xl">
                  <p className="text-gray-500 font-semibold uppercase text-[9px] tracking-wider">Estudiante</p>
                  <p className="text-gray-200 font-bold mt-1 text-sm">{activeReceipt.studentName}</p>
                  <p className="text-gray-500 mt-0.5">Teléfono: {activeReceipt.studentPhone}</p>
                </div>
                <div className="p-3 bg-gray-900/40 border border-gray-900 rounded-2xl">
                  <p className="text-gray-500 font-semibold uppercase text-[9px] tracking-wider">Método de Pago</p>
                  <p className="text-gray-200 font-bold mt-1 text-sm">{activeReceipt.method}</p>
                  <p className="text-gray-500 mt-0.5">Estado: {activeReceipt.balance === 0 ? 'PAGADO TOTAL' : 'PAGADO PARCIAL'}</p>
                </div>
              </div>

              {/* Course Itemized Detail Table */}
              <div className="border border-gray-800 rounded-2xl overflow-hidden text-xs">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-900/80 border-b border-gray-800 text-gray-400 font-semibold">
                      <th className="py-2.5 px-4 text-left">Concepto / Curso</th>
                      <th className="py-2.5 px-4 text-right">Monto Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-gray-300">
                      <td className="py-3 px-4">
                        <p className="font-bold text-gray-200">{activeReceipt.courseName}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Inscripción y matrícula de curso</p>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold">Bs. {activeReceipt.totalCost}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Financial Balance Summary */}
              <div className="flex justify-end text-xs">
                <div className="w-56 space-y-2 p-4 rounded-2xl bg-gray-900/30 border border-gray-900">
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Subtotal:</span>
                    <span className="text-gray-300 font-semibold">Bs. {activeReceipt.totalCost}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-bold border-t border-gray-800/60 pt-2">
                    <span>Monto Abonado:</span>
                    <span>Bs. {activeReceipt.amountPaid}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-800/60 pt-2 font-bold">
                    <span className="text-gray-400">Saldo Pendiente:</span>
                    <span className={activeReceipt.balance > 0 ? 'text-rose-400' : 'text-gray-300'}>
                      Bs. {activeReceipt.balance}
                    </span>
                  </div>
                </div>
              </div>

              {/* Signatures and QR Code */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-6 border-t border-gray-800">
                {/* Decorative Verification QR Code */}
                <div className="flex items-center gap-3">
                  <div className="bg-white p-1 rounded-xl w-16 h-16 flex items-center justify-center border border-gray-200">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=VerificacionNextAcademy-${activeReceipt.receiptNo}`} 
                      alt="Verification QR" 
                      className="w-14 h-14 object-contain" 
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">Recibo Autorizado</p>
                    <p className="text-[8px] text-gray-500 leading-normal max-w-[150px] mt-0.5">Escanea para verificar la validez de la transacción en el sistema ERP.</p>
                  </div>
                </div>

                {/* Digital Signature line */}
                <div className="text-center w-48 border-t border-dashed border-gray-700 pt-3 mt-6 sm:mt-0">
                  <p className="text-[10px] font-bold text-gray-300">Firma Secretaria / Caja</p>
                  <p className="text-[8px] text-gray-500 mt-0.5">NextAcademy ERP</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
