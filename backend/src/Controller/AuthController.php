<?php

namespace App\Controller;

use App\Service\UserService;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/auth', name: 'api_auth_')]
class AuthController extends AbstractController
{
    private UserService $userService;
    private JWTTokenManagerInterface $jwtManager;

    public function __construct(
        UserService $userService,
        JWTTokenManagerInterface $jwtManager
    ) {
        $this->userService = $userService;
        $this->jwtManager = $jwtManager;
    }

    #[Route('/register', name: 'register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json([
                'success' => false,
                'message' => 'Dados inválidos'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Validar dados obrigatórios
        if (!isset($data['email']) || !isset($data['password']) || !isset($data['name'])) {
            return $this->json([
                'success' => false,
                'message' => 'Email, senha e nome são obrigatórios'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Validar força da senha (opcional)
        $passwordValidation = $this->userService->validatePasswordStrength($data['password']);
        if (!$passwordValidation['valid']) {
            return $this->json([
                'success' => false,
                'message' => 'Senha não atende aos critérios de segurança',
                'password_errors' => $passwordValidation['errors']
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $result = $this->userService->createUser($data);

        if (!$result['success']) {
            $statusCode = isset($result['message']) && 
                         str_contains($result['message'], 'já está sendo usado') ? 
                         Response::HTTP_CONFLICT : 
                         Response::HTTP_UNPROCESSABLE_ENTITY;

            return $this->json([
                'success' => false,
                'message' => $result['message'] ?? 'Erro na validação',
                'errors' => $result['errors'] ?? []
            ], $statusCode);
        }

        // Gerar token
        $token = $this->jwtManager->create($result['user']);

        return $this->json([
            'success' => true,
            'message' => 'Usuário criado com sucesso',
            'data' => [
                'user' => $result['user'],
                'token' => $token
            ]
        ], Response::HTTP_CREATED, [], ['groups' => ['user:read']]);
    }

    #[Route('/login', name: 'login', methods: ['POST'])]
    public function login(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['email']) || !isset($data['password'])) {
            return $this->json([
                'success' => false,
                'message' => 'Email e senha são obrigatórios'
            ], Response::HTTP_BAD_REQUEST);
        }

        $result = $this->userService->validateLogin($data['email'], $data['password']);

        if (!$result['success']) {
            return $this->json([
                'success' => false,
                'message' => $result['message']
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Gerar token
        $token = $this->jwtManager->create($result['user']);

        return $this->json([
            'success' => true,
            'message' => 'Login realizado com sucesso',
            'data' => [
                'user' => $result['user'],
                'token' => $token
            ]
        ], Response::HTTP_OK, [], ['groups' => ['user:read']]);
    }

    #[Route('/me', name: 'me', methods: ['GET'])]
    public function getCurrentUser(): JsonResponse
    {
        $user = $this->getUser();

        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Usuário não autenticado'
            ], Response::HTTP_UNAUTHORIZED);
        }

        $userStats = $this->userService->getUserStatistics($user);

        return $this->json([
            'success' => true,
            'data' => [
                'user' => $user,
                'statistics' => $userStats
            ]
        ], Response::HTTP_OK, [], ['groups' => ['user:read']]);
    }

    #[Route('/refresh', name: 'refresh', methods: ['POST'])]
    public function refresh(): JsonResponse
    {
        $user = $this->getUser();

        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Usuário não autenticado'
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Gerar novo token
        $token = $this->jwtManager->create($user);

        return $this->json([
            'success' => true,
            'data' => [
                'token' => $token
            ]
        ], Response::HTTP_OK);
    }

    #[Route('/profile', name: 'update_profile', methods: ['PUT', 'PATCH'])]
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $this->getUser();

        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Usuário não autenticado'
            ], Response::HTTP_UNAUTHORIZED);
        }

        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json([
                'success' => false,
                'message' => 'Dados inválidos'
            ], Response::HTTP_BAD_REQUEST);
        }

        // Se está atualizando a senha, validar força
        if (isset($data['password']) && !empty($data['password'])) {
            $passwordValidation = $this->userService->validatePasswordStrength($data['password']);
            if (!$passwordValidation['valid']) {
                return $this->json([
                    'success' => false,
                    'message' => 'Senha não atende aos critérios de segurança',
                    'password_errors' => $passwordValidation['errors']
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        $result = $this->userService->updateUser($user, $data);

        if (!$result['success']) {
            $statusCode = isset($result['message']) && 
                         str_contains($result['message'], 'já está sendo usado') ? 
                         Response::HTTP_CONFLICT : 
                         Response::HTTP_UNPROCESSABLE_ENTITY;

            return $this->json([
                'success' => false,
                'message' => $result['message'] ?? 'Erro na validação',
                'errors' => $result['errors'] ?? []
            ], $statusCode);
        }

        return $this->json([
            'success' => true,
            'message' => 'Perfil atualizado com sucesso',
            'data' => $result['user']
        ], Response::HTTP_OK, [], ['groups' => ['user:read']]);
    }
}