import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Container } from '../components/ui/Container';
import { Seo } from '../components/seo/Seo';
import { auth } from '../src/firebase';
import { getAuthErrorMessage } from '../src/utils/authErrors';
import { NOINDEX_ROBOTS } from '../src/seo';

const SUCCESS_MESSAGE = '등록된 계정이라면 비밀번호 재설정 이메일이 발송됩니다. 메일함과 스팸함을 확인해주세요.';

export const ForgotPassword: React.FC = () => {
    const location = useLocation();
    const state = location.state as { email?: string } | null;
    const [email, setEmail] = useState(state?.email || '');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const loginPath = new URLSearchParams(location.search).get('from') === 'admin' ? '/admin/login' : '/login';

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            auth.languageCode = 'ko';
            await sendPasswordResetEmail(auth, email.trim());
            setSuccess(true);
        } catch (err: any) {
            if (err?.code === 'auth/user-not-found') {
                setSuccess(true);
            } else {
                setError(getAuthErrorMessage(err?.code));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center bg-gray-50 px-4 py-20">
            <Seo
                title="비밀번호 재설정 | 행사어때"
                description="행사어때 계정의 비밀번호를 재설정합니다."
                canonical="/forgot-password"
                robots={NOINDEX_ROBOTS}
            />
            <Container>
                <div className="mx-auto w-full max-w-md rounded-lg border border-gray-100 bg-white p-6 shadow-lg md:p-10">
                    <h1 className="text-2xl font-bold text-gray-900">비밀번호 재설정</h1>
                    <p className="mt-3 text-sm leading-6 text-gray-600">
                        가입한 이메일을 입력하면 비밀번호 재설정 안내를 보내드립니다.
                    </p>

                    <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                        <div>
                            <label htmlFor="reset-email" className="mb-2 block text-sm font-medium text-gray-700">이메일</label>
                            <input
                                id="reset-email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#39B54A] focus:ring-2 focus:ring-[#39B54A]/20"
                                placeholder="example@email.com"
                            />
                        </div>

                        {success && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm leading-6 text-green-800">{SUCCESS_MESSAGE}</p>}
                        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm leading-6 text-red-700">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-[#39B54A] py-3 font-semibold text-white transition-colors hover:bg-[#2F9A3F] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? '보내는 중...' : '재설정 이메일 보내기'}
                        </button>
                    </form>

                    <Link to={loginPath} className="mt-6 block text-center text-sm font-medium text-[#39B54A] hover:underline">
                        로그인 화면으로 돌아가기
                    </Link>
                </div>
            </Container>
        </div>
    );
};
