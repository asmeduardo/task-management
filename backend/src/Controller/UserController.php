<?php

namespace App\Controller;

use App\Service\UserService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/users', name: 'api_users_')]
class UserController extends AbstractController
{
    private UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    #[Route('/profile', name: 'profile', methods: ['GET'])]
    public function getProfile(): JsonResponse
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
                'profile' => $user,
                'statistics' => $userStats
            ]
        ], Response::HTTP_OK, [], ['groups' => ['user:read']]);
    }

    #[Route('/check-email/{email}', name: 'check_email', methods: ['GET'])]
    public function checkEmailAvailability(string $email): JsonResponse
    {
        $available = $this->userService->isEmailAvailable($email);

        return $this->json([
            'success' => true,
            'data' => [
                'email' => $email,
                'available' => $available
            ]
        ], Response::HTTP_OK);
    }
}