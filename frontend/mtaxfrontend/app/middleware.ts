// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Хамгаалах шаардлагатай замууд
const protectedRoutes = {
  admin: ['/admin', '/admin/:path*'],
  teacher: ['/teacher', '/teacher/:path*'],
  student: ['/student', '/student/:path*'],
};

// Хэрэглэгчийн эрхээс хамаарч хандах боломжтой замууд
const roleRoutes = {
  admin: ['/admin', '/admin/:path*', '/teacher', '/teacher/:path*', '/student', '/student/:path*'],
  teacher: ['/teacher', '/teacher/:path*', '/student', '/student/:path*'],
  student: ['/student', '/student/:path*'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Нийтийн замууд (хэн ч хандах боломжтой)
  const publicPaths = ['/', '/auth', '/verify-email', '/about', '/company'];
  if (publicPaths.some(path => pathname === path || pathname.startsWith('/verify-email'))) {
    return NextResponse.next();
  }
  
  // Хэрэглэгчийн мэдээллийг cookie болон localStorage-аас авах
  const userCookie = request.cookies.get('user');
  let userRole = null;
  let userId = null;
  
  if (userCookie) {
    try {
      const userData = JSON.parse(decodeURIComponent(userCookie.value));
      userRole = userData.role || userData.user_role;
      userId = userData.id;
    } catch (e) {
      console.error('Error parsing user cookie:', e);
    }
  }
  
  // Хэрэглэгч нэвтрээгүй бол login хуудас руу чиглүүлэх
  if (!userId) {
    // API замуудыг шалгах
    if (pathname.startsWith('/api/')) {
      return NextResponse.next();
    }
    
    // Хамгаалагдсан зам руу орох гэж байгаа бол
    const isProtectedPath = 
      pathname.startsWith('/admin') ||
      pathname.startsWith('/teacher') ||
      pathname.startsWith('/student');
    
    if (isProtectedPath) {
      const loginUrl = new URL('/auth', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    return NextResponse.next();
  }
  
  // Админ замыг шалгах - зөвхөн admin эрхтэй хүн хандах боломжтой
  if (pathname.startsWith('/admin')) {
    if (userRole?.toLowerCase() !== 'admin') {
      // Админ биш бол нүүр хуудас руу чиглүүлэх
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  // Багшийн замыг шалгах - зөвхөн teacher эсвэл admin хандах боломжтой
  if (pathname.startsWith('/teacher')) {
    if (userRole?.toLowerCase() !== 'teacher' && userRole?.toLowerCase() !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  // Оюутны замыг шалгах - бүх хэрэглэгч хандах боломжтой
  if (pathname.startsWith('/student')) {
    // Оюутан, багш, админ бүгд хандах боломжтой
    // Зөвхөн нэвтрээгүй хэрэглэгчийг шалгасан
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};