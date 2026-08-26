export default async function handleExecutiveActivate(request, env) {
  if (request.method !== 'POST') {
    return Response.json(
      { error: 'Method not allowed' },
      { status: 405 }
    );
  }

  try {
    const { memberNo, key } = await request.json();

    const cleanMemberNo = String(memberNo || '').padStart(3, '0');

    if (!['001', '002', '003', '004', '005'].includes(cleanMemberNo)) {
      return Response.json(
        { error: 'Invalid executive member number' },
        { status: 400 }
      );
    }

    const expectedKey = env[`EXEC_KEY_${cleanMemberNo}`];

    if (!expectedKey || !key || key !== expectedKey) {
      return Response.json(
        { error: 'Invalid activation link' },
        { status: 401 }
      );
    }

    return Response.json(
      {
        activated: true,
        memberNo: cleanMemberNo,
        role: 'executive',
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (err) {
    console.error('Executive activation failed:', err);

    return Response.json(
      { error: 'Activation failed' },
      { status: 500 }
    );
  }
}
